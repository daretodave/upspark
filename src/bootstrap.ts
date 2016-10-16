/// <reference path="typings/index.d.ts" />

const {app, BrowserWindow} = require('electron');

let win:any;

let init = () => {
    win = new BrowserWindow({width: 800, height: 800, frame: false})
    win.loadURL(`http://localhost:8080/app/app.html`);
    win.on('closed', () => {
        win = null;
    });
};

app.on('ready', init);
