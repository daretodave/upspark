/// <reference path="../typings/index.d.ts" />
import {Resource} from './system/resource';
import {Settings} from "./system/settings";
import {Size} from "./model/size";
import {Location} from "./model/location";
import {Style} from "./window/style";
import {TextTranslator} from "./system/resource/translators/translate-text";

const path = require('path');
const electron = require('electron');
const {app, BrowserWindow, Tray, Menu, globalShortcut, shell} = electron;

let settings: any;
let runner: any;
let tray: any;
let quit:boolean = false;
let resources:Resource;

let init = () => {

    resources = new Resource(path.join(app.getPath('home'), '.upspark'));
    resources.attach('settings.json', Settings);
    resources.attach('style.css', Style, new TextTranslator());

    Promise.all([
        resources.load('settings'),
        resources.load('style')
    ])
    .then(() => {
        initSettings();
        initRunner();
        initTray();

        runner.webContents.on('did-finish-load', adhereSettings);
    }).catch((e) => {
        console.log(e);
        //TODO: Error window
    });


};

let reload = () => {
    Promise.all([
        resources.reload('settings'),
        resources.reload('style')
    ])
    .then(() => adhereSettings())
    .catch((e) => {
        console.log(e);
        //TODO: Error window
    });
};

let adhereSettings = () => {
    globalShortcut.unregisterAll();

    Promise.all([
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
            height: .33
        }),
        resources.get('style', 'content', '')
    ]).then((values) => {

        let hotkey:string = values[0];
        let location:Location = values[1];
        let size:Size = values[2];
        let style:string = values[3];

        let displays:any[] = electron.screen.getAllDisplays();
        let display = displays[Math.min(Math.max(location.screen, 0), displays.length-1)];

        let x:number = display.bounds.x + (display.bounds.width * location.x);
        let y:number = display.bounds.y + (display.bounds.width * location.y);

        let width:number = size.width * display.bounds.width;
        let height:number = size.height * display.bounds.height;

        x += width * location.offsetX;
        y += height * location.offsetY;

        x = Math.floor(x);
        y = Math.floor(y);

        width = Math.ceil(width);
        height = Math.ceil(height);

        runner.setPosition(x, y);
        runner.setSize(width, height);
        runner.webContents.send('style', style);

        globalShortcut.register(hotkey, toggleRunner);
    }).catch((error) => {
        console.log(error);
        //TODO: Error window
    });
};
let toggleRunner = () => {
    runner.isVisible() ? runner.hide() : runner.show()
};
let initTray = () => {
    tray = new Tray(path.join(__dirname, 'static', 'icon', '512.png'));
    
    let options: any = [];

    options.push({
        'label': 'Settings',
        click: () => settings.show()
    });
    
    options.push({
        'type': 'separator',
    });
    options.push({
       'label': 'Runner',
        click: () => runner.show()
    });
    options.push({
        'label': 'Resources',
        click() {
            electron.shell.openItem(resources.root);
        }
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

    tray.on('click', toggleRunner);
    
    tray.setContextMenu(Menu.buildFromTemplate(options));
    tray.setToolTip('Upspark');
};

let initSettings = () => {
    let options: any = {};

    options.width  = 800;
    options.height = 500;
    options.show = false;
    options.title = 'Upspark - Settings';
    options.icon = path.join(__dirname, 'static', 'icon', 'bulb.ico');

    settings = new BrowserWindow(options);
    settings.loadURL(www('settings'));
    settings.setMenu(null);

    settings.on('close', (e:any) => {
        if(quit) {
            settings = null;
        } else {
            e.preventDefault();
            settings.hide();
        }
    });

};

let initRunner = () => {
    let options: any = {};

    options.width  = 500;
    options.height = 100;
    options.frame = false;
    options.resizable = true;
    options.movable = false;
    options.maximizable = false;
    options.minimizable = false;
    options.transparent = true;
    options.alwaysOnTop = true;
    options.skipTaskbar = true;
    options.title = 'Upspark - Runner';
    options.show = false;
    options.icon = path.join(__dirname, 'static', 'icon', 'bulb.ico');

    if (process.env.ENV === 'development') {
        options.frame = true;
    }

    runner = new BrowserWindow(options);
    runner.loadURL(www('runner'));

    runner.on('show', () => {
        tray.setHighlightMode('always')
    });
    runner.on('hide', () => {
        tray.setHighlightMode('never')
    });

    runner.on('close', (e:any) => {
        if(quit) {
            runner = null;
        } else {
            e.preventDefault();
            runner.hide();
        }
    });



};

app.on('ready', init);
app.on('activate', () => runner.show());
app.on('before-quit', () => quit = true);

function www(path = '') {
    let __root = './index.html/#/';
    
    if (process.env.ENV === 'development') {
        __root = 'http://localhost:8080/#/';
    }
    
    return `${__root}${path}`
}