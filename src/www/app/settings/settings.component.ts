import {Component, AfterViewInit} from '@angular/core';

require('./settings.component.scss');

const {ipcRenderer} = require('electron');

declare let APP_VERSION:string;

@Component({
    selector: 'up-settings',
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements AfterViewInit {

    private version:string = APP_VERSION;

    ngAfterViewInit() {
        ipcRenderer.removeAllListeners('style-settings');
        ipcRenderer.on('style-settings', (event:any, arg:string) => {

            let style = document.getElementById('settings-style');
            if (style === null) {
                style = document.createElement('style');
                style.setAttribute("id", "settings-style");

                document.head.appendChild(style);
            }

            style.innerHTML = arg;
        });
    }

    openWebsite() {
        ipcRenderer.send('site');
    }

    constructor() {
    }

}