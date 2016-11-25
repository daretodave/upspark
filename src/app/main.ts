/// <reference path="../typings/index.d.ts" />
import {Resource} from './system/resource';
import {Settings} from "./window/runner/settings";
import {Size} from "./model/size";
import {Location} from "./model/location";
import {RunnerStyle} from "./window/runner-style";
import {GlobalStyle} from "./window/global-style";
import {TextTranslator} from "./system/resource/translators/translate-text";
import {Safe} from "./system/safe";
import {Themes} from "./window/themes";
import {ResourceMissingPolicy} from "./system/resource/resource-missing-policy";

const path = require('path');
const electron = require('electron');
const {app, BrowserWindow, Tray, Menu, globalShortcut, shell, ipcMain, dialog} = electron;

let settingsWindow: any;
let runnerWindow: any;
let safeWindow: any;

let tray: any;
let quit:boolean = false;

let resources:Resource;
let safe: Safe;


let init = () => {

    safe = new Safe(path.join(app.getPath('appData'), 'upspark'), 'aes-256-ctr');
    resources = new Resource(path.join(app.getPath('home'), '.upspark'));

    resources.attach('settings.json', Settings);

    resources.attach('runner.css', RunnerStyle, new TextTranslator(), 'runner-style', ResourceMissingPolicy.DEFAULT);
    resources.attach('global.css', GlobalStyle, new TextTranslator(), 'global-style', ResourceMissingPolicy.DEFAULT);

    Promise.all([
        resources.load('settings'),
        resources.load('runner-style'),
        resources.load('global-style'),
        safe.init()
    ])
    .then((values:any[]) => {
        let promises: Promise<any>[] = [values[0]];

        let settings: Settings = values[0];

        promises.push(settings.theme.global ? Themes.load('global', settings.theme.global) : null);
        promises.push(settings.theme.runner ? Themes.load('runner', settings.theme.runner) : null);

        return Promise.all(promises);
    })
    .then((values:any[]) => {
        let settings: Settings = values[0];
        if (values[1] !== null) {
            Themes.setTheme('global', settings.theme.global, values[1]);
        }
        if (values[2] !== null) {
            Themes.setTheme('runner', settings.theme.runner, values[2]);
        }

        initSettings();
        initRunner();
        initSafe();
        initTray();

        runnerWindow.webContents.on('did-finish-load', adhereSettings);
    }).catch((e) => {
        console.log(e);
        //TODO: Error window
    });

};

let reload = () => {
    Promise.all([
        resources.reload('settings'),
        resources.reload('runner-style'),
        resources.reload('global-style')
    ])
    .then(() => adhereSettings())
    .catch((e) => {
        console.log(e);
        //TODO: Error window
    });
};

function rotate(cx:number, cy:number, x:number, y:number, angle:number) {
    let radians = angle * Math.PI / 180;

    const cos = Math.cos(radians),
        sin = Math.sin(radians),
        ox = x - cx,
        oy = y - cy,
        nx = (cos * ox) + (sin * oy) + cx,
        ny = (sin * ox) + (cos * oy) + cy;
    return [Math.round(nx), Math.round(ny)];
}

let adhereSettings = ():Promise<any> => {
    globalShortcut.unregisterAll();

    if (Themes.has('global')) {
        let css:string = Themes.getCSS('global');

        settingsWindow.webContents.send('style-settings', css);
        safeWindow.webContents.send('style-safe', css);
    }

    if (Themes.has('runner')) {
        let css:string = Themes.getCSS('runner');

        runnerWindow.webContents.send('style-runner', css);
    }

    return Promise.all([
        resources.get('settings', 'hotkey', 'Control+`'),
        resources.get('settings', 'location', {
            x: 0,
            y: 0,
            offsetX: 0,
            offsetY: .5,
            screen: 0
        }),
        resources.get('settings', 'size', {
            width: 1,
            height: .5
        }),
        resources.get('runner-style', 'content', ''),
        resources.get('global-style', 'content', ''),
        resources.get('settings', 'rotation', 0),
    ]).then((values) => {
        let metrics:string = '';

        let hotkey:string = values[0];
        let location:Location = values[1];
        let size:Size = values[2];
        let runnerStyle:string = values[3];
        let globalStyle:string = values[4];
        let rotation:number = values[5];

        let displays:any[] = electron.screen.getAllDisplays();
        let display = displays[Math.min(Math.max(location.screen, 0), displays.length-1)];

        let x:number = display.bounds.x + (display.bounds.width * location.x);
        let y:number = display.bounds.y + (display.bounds.height * location.y);

        let runnerWidth:number = size.width * display.bounds.width;
        let runnerHeight:number = size.height * display.bounds.height;
        let width:number = runnerWidth;
        let height:number = runnerHeight;

        x += width * location.offsetX;
        y += height * location.offsetY;

        if(rotation !== 0 && rotation !== 360) {

            let cx:number = width/2 + x;
            let cy:number = height/2 + y;

            let topRightPoint:number[] = rotate(cx, cy, x+width, y, rotation);
            let bottomRightPoint:number[] = rotate(cx, cy, x+width, y+height, rotation);
            let topLeftPoint:number[] = rotate(cx, cy, x, y,  rotation);
            let bottomLeftPoint:number[] = rotate(cx, cy,x, y+height,  rotation);



            x = Math.min(topLeftPoint[0], Math.min(topRightPoint[0],  Math.min(bottomLeftPoint[0], bottomRightPoint[0])));
            y = Math.min(topLeftPoint[1], Math.min(topRightPoint[1],  Math.min(bottomLeftPoint[1], bottomRightPoint[1])));

            let upperX:number = Math.max(topLeftPoint[0], Math.max(topRightPoint[0],  Math.max(bottomLeftPoint[0], bottomRightPoint[0])));
            let upperY:number = Math.max(topLeftPoint[1], Math.max(topRightPoint[1],  Math.max(bottomLeftPoint[1], bottomRightPoint[1])));

            width = Math.abs(upperX - x);
            height = Math.abs(upperY - y);

            runnerWidth -= 15;
            runnerHeight -= 15;

            metrics = `
                up-runner {
                    position: absolute;
                    top:50%;
                    left: 50%;
                    overflow-x:visible;
                    overflow-y:visible;
                }
                #runner {
                    width: ${runnerWidth}px;
                    height: ${runnerHeight}px;
                    transform: translateY(-50%) translateX(-50%) rotate(${rotation}deg);
                }
                body {
                    overflow: hidden;
                }
            `;
        }

        x = Math.floor(x);
        y = Math.floor(y);

        width = Math.ceil(width);
        height = Math.ceil(height);

        console.log('Runner resize and relocated to [x,y,w,h]', x, y, width, height, rotation, runnerWindow.getMaximumSize());

        runnerWindow.setBounds({
            x: x,
            y: y,
            width: width,
            height: height
        });

        runnerWindow.webContents.send('metrics', metrics);
        runnerWindow.webContents.send('style', runnerStyle);
        settingsWindow.webContents.send('style-global', globalStyle);

        globalShortcut.register(hotkey, toggleRunner);
    }).catch((error) => {
        console.log(error);
        //TODO: Error window
    });
};
let openResourceDirectory = () => {
    electron.shell.openItem(resources.root);
};
let toggleRunner = () => {
    runnerWindow.isVisible() ? runnerWindow.hide() : runnerWindow.show()
};
let initTray = () => {
    tray = new Tray(path.join(__dirname, 'static', 'icon', '512.png'));
    
    let options: any = [];

    options.push({
        'label': 'Settings',
        click: () => settingsWindow.show()
    });
    options.push({
        'label': 'Safe',
        click: () => safeWindow.show()
    });
    
    options.push({
        'type': 'separator',
    });
    options.push({
       'label': 'Runner',
        click: () => runnerWindow.show()
    });
    options.push({
        'label': 'Resources',
        click: () => openResourceDirectory()
    });
    options.push({
        'label': 'Reload',
        click: () => reload()
    });
    
    options.push({
        'type': 'separator',
    });
    options.push({
        'label': 'Documentation',
        click: () => shell.openExternal('https://upspark.io/documentation')
    });
    options.push({
        'label': 'Feedback',
        click: () => shell.openExternal('https://upspark.io/feedback')
    });
    
    options.push({
        'type': 'separator',
    });
    options.push({
        'label': 'Exit',
        click: () => app.quit()
    });

    if (process.env.ENV === 'development') {
        options.push({
            'type': 'separator',
        });
        options.push({
            'label': 'Load Settings',
            click: () => settingsWindow.loadURL(www('settings'))
        });
        options.push({
            'label': 'Load Safe Auth',
            click: () => safeWindow.loadURL(www('safe/auth'))
        });
        options.push({
            'label': 'Load Safe Create',
            click: () => safeWindow.loadURL(www('safe/create'))
        });
        options.push({
            'label': 'Load Safe',
            click: () => safeWindow.loadURL(www('safe/main'))
        });
    }

    tray.on('click', toggleRunner);
    
    tray.setContextMenu(Menu.buildFromTemplate(options));
    tray.setToolTip('Upspark');
};

let initSafe = () => {
    let options: any = {};

    options.width  = 650;
    options.height = 640;
    options.show = false;
    options.title = 'Upspark - Safe';
    options.icon = path.join(__dirname, 'static', 'icon', 'bulb.ico');

    safeWindow = new BrowserWindow(options);
    if(safe.created) {
        safeWindow.loadURL(www('safe/auth'));
    } else {
        safeWindow.loadURL(www('safe/create'));
    }

    if (process.env.ENV !== 'development') {
        safeWindow.setMenu(null);
    }

    safeWindow.webContents.on('did-finish-load', () => {
       if(Themes.has('global')) {
           safeWindow.webContents.send('style-safe', Themes.getCSS('global'));
       }
    });

    safeWindow.on('close', (e:any) => {
        if(quit) {
            safeWindow = null;
        } else {
            e.preventDefault();
            safeWindow.hide();
        }
    });

    ipcMain.on('safe-create', (event:any, password:string) => {
        if(safe.created) {
            return;
        }
        console.log('Safe:creating');
        event.sender.send('safe-loader', 'on');
        setTimeout(() => {
            safe.build(password).then(() => {
                event.sender.send('safe-loader', 'off');
                event.sender.send('safe-main', {});
            }).catch((e:any) => {
                console.log(e);
                event.sender.send('safe-loader', 'off');
                safeWindow.loadURL(www('safe/create'));
            });
        }, 2000);
    });

    ipcMain.on('safe-reset', (event:any) => {
        if(!safe.created) {
            return;
        }
        event.sender.send('safe-loader', 'on');
        console.log('Safe:resetting');
        setTimeout(() => {
            safe.reset().then(() => {
                event.sender.send('safe-loader', 'off');
                event.sender.send('safe-create');
            }).catch((e:any) => {
                console.log(e);
                event.sender.send('safe-loader', 'off');
                event.sender.send('safe-auth');
            });
        }, 2000);
    });

    ipcMain.on('safe-auth', (event:any, password:string) => {
        if(!safe.created) {
            return;
        }
        console.log('Safe:auth');
        event.sender.send('safe-loader', 'on');
        setTimeout(() => {
            safe.unlock(password).then((mappings) => {
                event.sender.send('safe-loader', 'off');
                event.sender.send('safe-main', mappings);
            }).catch((e:any) => {
                console.log(e);
                event.sender.send('safe-loader', 'off');
                event.sender.send('safe-auth-error', e);
            });
        }, 2000);
    });

    ipcMain.on('safe-export', (event:any, password:string, exportLocation:string, options:string[]) => {
        if(!safe.auth || !password || !exportLocation || !options.length) {
            return;
        }
        console.log('Safe:export', exportLocation, options);
        event.sender.send('safe-loader', 'on');
        safe.export(password, exportLocation, options).then(() => {
            dialog.showMessageBox(safeWindow, {
                type: "info",
                message: `Exported ${options.length} keys successfully`,
                buttons: []
            });
            event.sender.send('safe-loader', 'off');
            event.sender.send('safe-main', safe.getMappings());
        }).catch((error) => {
            console.log(error);

            dialog.showMessageBox(safeWindow, {
                type: "error",
                message: "Could not complete the export",
                buttons: []
            });
            event.sender.send('safe-loader', 'off');
        });
    });

    ipcMain.on('safe-main', (event:any) => {
        console.log('Safe:main');
        event.sender.send('safe-main', safe.getMappings());
    });

    ipcMain.on('safe-update', (event:any, password:string) => {
        if(!safe.created || !safe.auth) {
            event.sender.send('safe-auth');
            return;
        }
        console.log('Safe:update');
        event.sender.send('safe-loader', 'on');
        setTimeout(() => {
            safe.build(password).then(() => {
                event.sender.send('safe-loader', 'off');
                event.sender.send('safe-main', safe.getMappings());
            }).catch((e:any) => {
                console.log(e);
                event.sender.send('safe-loader', 'off');
                event.sender.send('safe-auth');
            });
        }, 2000);
    });

    ipcMain.on('safe-lock', (event:any) => {
        if(!safe.created) {
            return;
        }
        console.log('Safe:lock');
        safe.lock();
        event.sender.send('safe-auth');
    });

    ipcMain.on('safe-delete', (event:any, key:string) => {
        if(!safe.auth) {
            return;
        }
        console.log('Safe:delete');

        safe.remove(key)
            .save()
            .catch((e:any) => {
                console.log(e);
                safe.lock();
                event.sender.send('safe-auth');
            });
    });

    ipcMain.on('safe-new', (event:any, key:string, value:string) => {
        if(!safe.created) {
            return;
        }
        console.log('Safe:new');

        if(safe.has(key)) {
            event.sender.send('safe-new-error', 'key', `'${key}' is already in use`);
            return;
        }

        safe.set(key, value)
            .save()
            .then(() => {
                event.sender.send('safe-main', safe.getMappings());
            }).catch((e:any) => {
                console.log(e);

                safe.lock();
                event.sender.send('safe-auth');
            });
    });

    ipcMain.on('safe-export-select', (event:any) => {
        dialog.showSaveDialog(safeWindow, {
            title: 'Select Export File',
            filters: [
                {
                    name: 'Safe Entries',
                    extensions: ['safe']
                }
            ]
        }, (location:string) => {
            event.sender.send('safe-export-select', location);
        });
    });

    ipcMain.on('safe-edit', (event:any, key:string, previousKey:string, value: string) => {
        if(!safe.auth) {
            return;
        }
        console.log('Safe:edit');

        if(previousKey !== key) {
            safe.remove(previousKey);
        }
        safe.set(key, value)
            .save()
            .then(() => {
                event.sender.send('safe-main', safe.getMappings());
            }).catch((e:any) => {
            console.log(e);

            safe.lock();
            event.sender.send('safe-auth');
        });
    });

    ipcMain.on('safe-import-final', (event:any, values:any[]) => {
        if(!safe.auth) {
            return;
        }
        console.log('Safe:import-final');

        values.forEach((value) => {
            safe.set(value.key, value.value);
        });
        safe
            .save()
            .then(() => {
                event.sender.send('safe-main', safe.getMappings());
            }).catch((e:any) => {

            safe.lock();
            event.sender.send('safe-auth');
        });
    });

    ipcMain.on('safe-import-select', (event:any) => {
        dialog.showOpenDialog(safeWindow, {
            title: 'Select Safe File',
            filters: [
                {
                    name: 'Safe Entries',
                    extensions: ['safe']
                }
            ]
        }, (locations:string[]) => {
            if(locations == null || !locations[0]) {
                return;
            }

            event.sender.send('safe-import-select', locations[0]);
        });
    });

    ipcMain.on('safe-import', (event:any, importLocation:string, password:string) => {
        if(!safe.created || !safe.auth) {
            event.sender.send('safe-auth');
            return;
        }
        console.log('Safe:import');
        event.sender.send('safe-loader', 'on');
        setTimeout(() => {
            safe.crack(importLocation, password, null, null).then((mappings:any) => {
                event.sender.send('safe-loader', 'off');
                event.sender.send('safe-import', mappings);
            }).catch((e:any) => {
                console.log(e);
                event.sender.send('safe-loader', 'off');
                event.sender.send('safe-import-error', 'Could not crack the safe with the password provided');
            });
        }, 2000);
    });
};
let onDisplayChange = () => {
    console.log('System:displays', 'updated');
    adhereSettings().then(() => {
        console.log('System:displays', 'updating settings');
        settingsWindow.webContents.send('display-updated');
    }).catch((e:any) => {
        console.log('System:displays', 'updating settings failed', e);
    });

};
let initSettings = () => {
    let options: any = {};

    options.width  = 1050;
    options.height = 600;
    options.show = false;
    options.title = 'Upspark - Settings';
    options.icon = path.join(__dirname, 'static', 'icon', 'bulb.ico');
    options.alwaysOnTop = true;

    settingsWindow = new BrowserWindow(options);
    settingsWindow.loadURL(www('settings'));

    if (process.env.ENV !== 'development') {
        settingsWindow.setMenu(null);
    }

    settingsWindow.on('close', (e:any) => {
        if(quit) {
            settingsWindow = null;
        } else {
            e.preventDefault();
            settingsWindow.hide();
        }
    });

    settingsWindow.webContents.on('did-finish-load', () => {
        if(Themes.has('global')) {
            settingsWindow.webContents.send('style-settings', Themes.getCSS('global'));
        }
    });

    electron.screen.on('display-removed', onDisplayChange);
    electron.screen.on('display-added', onDisplayChange);
    electron.screen.on('display-metrics-changed', onDisplayChange);

    ipcMain.on('settings-metrics-reset', (event:any, args:any) => {

        console.log('Settings:reset-metrics');

        let settings:Settings = resources.syncGet<Settings>('settings');
        let screen:number = settings.location.screen;
        let hotkey:string = settings.hotkey;

        settings.toDefaultState();

        settings.location.screen = screen;
        settings.hotkey = hotkey;

        adhereSettings().then(() => {
            resources.save('settings');
            event.sender.send('settings-metrics-reload');
        });


    });

    ipcMain.on('settings-display-reset', (event:any, args:any) => {

        console.log('Settings:reset-display');

        let settings:Settings = resources.syncGet<Settings>('settings');
        settings.location.screen = 0;

        adhereSettings().then(() => {
            resources.save('settings');
            event.sender.send('settings-display-reload');
        });


    });

    ipcMain.on('settings-hotkey-reset', (event:any, args:any) => {

        console.log('Settings:reset-hotkey');

        let settings:Settings = resources.syncGet<Settings>('settings');
        settings.hotkey = 'Control+`';

        adhereSettings().then(() => {
            resources.save('settings');
            event.sender.send('settings-hotkey-reload');
        });


    });

    ipcMain.on('site', () => shell.openExternal('https://upspark.io'));

    ipcMain.on('get-themes', (event:any, args:any) => {
        event.returnValue = Themes.get(args);
    });

    ipcMain.on('open-resources', openResourceDirectory);
    ipcMain.on('get-setting', (event:any, args:any) => {
        let resolve:any = undefined;
        let settings:Settings = resources.syncGet<Settings>('settings');

        switch(args) {
            case 'resource-dir':
                resolve = resources.root;
                break;
            case 'width':
                resolve = settings.size.width;
                break;
            case 'height':
                resolve = settings.size.height;
                break;
            case 'x':
                resolve = settings.location.x;
                break;
            case 'y':
                resolve = settings.location.y;
                break;
            case 'offset-x':
                resolve = settings.location.offsetX;
                break;
            case 'offset-y':
                resolve = settings.location.offsetY;
                break;
            case 'screen':
                resolve = settings.location.screen;
                break;
            case 'theme-global':
                resolve = settings.theme.global;
                break;
            case 'theme-runner':
                resolve = settings.theme.runner;
                break;
            case 'hotkey':
                resolve = settings.hotkey;
                break;
            case 'rotation':
                resolve = settings.rotation;
                break;
            case 'screens':
                let screens:any[] = electron.screen.getAllDisplays().map((display:any) => {
                    let screen:any = {};

                    screen.rotation = display.rotation;
                    screen.x = display.bounds.x;
                    screen.y = display.bounds.y;
                    screen.width = display.bounds.width;
                    screen.height = display.bounds.height;
                    screen.id = display.id;

                    return screen;
                });

                resolve = screens;
                break;
            default:
                console.log('Settings:get', args, 'NOT FOUND');
                break;
        }

        event.returnValue = resolve;
    });

    ipcMain.on('set-setting', (event: any, setting:string, value:any, save:boolean) => {
        console.log('Settings:set', setting, value, `[save]=${save}`);
        resources.load('settings').then((settings:Settings) => {
            console.log('Settings:set..');
            switch(setting) {
                case 'width':
                    settings.size.width = value;
                    break;
                case 'height':
                    settings.size.height = value;
                    break;
                case 'x':
                    settings.location.x = value;
                    break;
                case 'y':
                    settings.location.y = value;
                    break;
                case 'offset-x':
                    settings.location.offsetX = value;
                    break;
                case 'offset-y':
                    settings.location.offsetY = value;
                    break;
                case 'screen':
                    settings.location.screen = value;
                    break;
                case 'rotation':
                    settings.rotation = value;
                    break;
                case 'theme-runner':
                    settings.theme.runner = value;
                    break;
                case 'theme-global':
                    settings.theme.global = value;
                    break;
                case 'hotkey':
                    settings.hotkey = value;
                    break;
                default:
                    console.log('Settings:set', setting, 'NOT FOUND');
                    break;
            }
        }).then(() => {
            console.log('Settings:set', 'adhere');

            let promises: Promise<any>[] = [];
            let target:string = setting.split('-')[1];

            if(setting.startsWith('theme') && !Themes.isLoaded(target, value)) {
                promises.push(Themes.load(target, value));
            }

            Promise.all(promises).then((values:any[]) => {
                if(values.length) {
                    Themes.setTheme(target, value, values[0]);
                }
                adhereSettings().then(() => {
                    if(save) {
                        console.log('Settings:set', 'save');
                        resources.save('settings');
                    }
                }).catch((reason:any) => {
                    console.log('Settings:set', 'adhere-fail', reason);
                });
            }).catch((reason:any) => {
                console.log('Settings:set', 'theme-load-fail', reason);
            });

        }).catch((reason:any) => {
            console.log('Settings:set', 'theme-load-fail', reason);
        });


    });
};

let initRunner = () => {
    let options: any = {};

    options.frame = false;
    options.resizable = false;
    options.movable = false;
    options.maximizable = false;
    options.minimizable = false;
    options.transparent = true;
    options.alwaysOnTop = true;
    options.skipTaskbar = true;
    options.enableLargerThanScreen = true;
    options.title = 'Upspark - Runner';
    options.show = false;
    options.icon = path.join(__dirname, 'static', 'icon', 'bulb.ico');

    runnerWindow = new BrowserWindow(options);
    runnerWindow.loadURL(www('runner'));

    runnerWindow.on('show', () => {
        tray.setHighlightMode('always')
    });
    runnerWindow.on('hide', () => {
        tray.setHighlightMode('never')
    });

    runnerWindow.on('close', (e:any) => {
        if(quit) {
            runnerWindow = null;
        } else {
            e.preventDefault();
            runnerWindow.hide();
        }
    });



};

app.on('ready', init);
app.on('activate', () => runnerWindow.show());
app.on('before-quit', () => quit = true);

function www(path = '') {
    let __root = './index.html/#/';
    
    if (process.env.ENV === 'development') {
        __root = 'http://localhost:8080/#/';
    }
    
    return `${__root}${path}`
}