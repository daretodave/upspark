/// <reference path="../typings/index.d.ts" />
import {Resource} from './system/resource';
import {Settings} from "./system/settings";
import {ResourceModel} from "./system/resource/resource-model";

const {app, BrowserWindow, Tray, Menu, shell} = require('electron');
const path = require('path');

let settings: any;
let runner: any;
let tray: any;
let quit:boolean = false;
let resources:Resource;

let init = () => {

    resources = new Resource(path.join(app.getPath('home'), '.horizon'));
    resources.attach('settings.json', Settings);

    resources.load('settings')
    .then(() => {
      initSettings();
      initRunner();
      initTray();
    }).catch(() => {
        console.log("what the fuck...");
    });


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
            console.log('..');
        }
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

    tray.on('click', () => {
        runner.isVisible() ? runner.hide() : runner.show()
    });
    
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
    options.resizable = false;
    options.movable = false;
    options.maximizable = false;
    options.minimizable = false;
    options.transparent = true;
    options.alwaysOnTop = true;
    options.skipTaskbar = true;
    options.title = 'Upspark - Runner';
    options.show = false;
    options.icon = path.join(__dirname, 'static', 'icon', 'bulb.ico');

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