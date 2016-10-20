/// <reference path="../typings/index.d.ts" />
const {app, BrowserWindow} = require('electron');

let settings:any;

let init = () => {
    openSettingsWindow();
};

let openSettingsWindow = () => {
    let options: any = {};
    
    options.width  = 600;
    options.height = 900;
    options.icon = www('static/icon/bulb.ico');
    
    settings = new BrowserWindow(options);
    settings.loadURL(www('index.html'));

    settings.on('closed', () => {
        settings = null;
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