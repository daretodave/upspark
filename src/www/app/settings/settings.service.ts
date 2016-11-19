import { Injectable } from '@angular/core';
import {Settings} from "./settings";

const {ipcRenderer} = require('electron');

@Injectable()
export class SettingsService {

    getSetting<T>(settingName:string):T {
        return ipcRenderer.sendSync('get-setting', settingName);
    }

    setSetting(settingName: string, value: any, save: boolean = false) {
        ipcRenderer.send('set-setting', settingName, value, save);
    }

    setSettings(settings: Settings) {
        settings.width = this.getSetting<number>('width');
        settings.height = this.getSetting<number>('height');
        settings.x = this.getSetting<number>('x');
        settings.y = this.getSetting<number>('y');
        settings.offsetX = this.getSetting<number>('offset-x');
        settings.offsetY = this.getSetting<number>('offset-y');
        settings.screen = this.getSetting<number>('screen');
        settings.hotkey = this.getSetting<string>('hotkey');
        settings.style = this.getSetting<string>('style');
    }
}