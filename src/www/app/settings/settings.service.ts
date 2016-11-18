import { Injectable } from '@angular/core';

const {ipcRenderer} = require('electron');

@Injectable()
export class SettingsService {

    getSetting(settingName:string):string {
        return ipcRenderer.sendSync('get-setting', settingName);
    }

}