/// <reference path="../typings/index.d.ts" />
const {app, BrowserWindow, Tray, Menu, shell} = require('electron');
const path = require('path');

let settings: any;
let runner: any;
let tray: any;

let init = () => {
    initSettings();
    initRunner();
    initTray();
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
    })
    
    tray.setContextMenu(Menu.buildFromTemplate(options));
    tray.setToolTip('Upspark');
};

let initSettings = () => {
    let options: any = {};

    options.width  = 600;
    options.height = 900;
    options.show = false;
    options.icon = path.join(__dirname, 'static', 'icon', 'bulb.ico');

    settings = new BrowserWindow(options);
    settings.loadURL(www('index.html'));

};

let initRunner = () => {
    let options: any = {};

    options.width  = 500;
    options.height = 100;
    options.frame = false;
    options.transparent = true;
    options.show = false;
    options.icon = path.join(__dirname, 'static', 'icon', 'bulb.ico');

    runner = new BrowserWindow(options);
    runner.loadURL(www('index.html/runner'));

    runner.on('show', () => {
        tray.setHighlightMode('always')
    });
    runner.on('hide', () => {
        tray.setHighlightMode('never')
    });

};

app.on('ready', init);

function www(path = '') {
    let __root = './';
    
    if (process.env.ENV === 'development') {
        __root = 'http://localhost:8080/';
    }
    
    return `${__root}${path}`
}