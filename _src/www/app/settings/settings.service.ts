import { Injectable } from '@angular/core';
import {Settings} from "./settings";
import {SettingsScreen} from "./settings-screen";

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
        settings.rotation = this.getSetting<number>('rotation');
        settings.resourceLocation = this.getSetting<string>('resource-dir');

        this.setHotkey(settings);
        this.setScreens(settings);
    }

    setHotkey(settings:Settings) {
        let blocks:string[] = this.getSetting<string>('hotkey').split('+');
        if (blocks.length === 1 && blocks[0].length) {
            let hotkey:string = blocks[0];

            settings.hotkey = hotkey;
            settings.hotkeyModifier = '--';
        } else if(blocks.length === 2) {
            let hotkey:string = blocks[1];
            let modifier:string = blocks[0].toUpperCase();

            if (modifier === "CONTROL") {
                modifier = 'Control';
            } else if(modifier === "COMMAND") {
                modifier = 'Command';
            } else {
                modifier = '--';
            }

            settings.hotkey = hotkey;
            settings.hotkeyModifier = modifier;
        } else {
            settings.hotkey = '';
            settings.hotkeyModifier = '';
        }
    }

    setScreens(settings:Settings) {
        settings.screens = this.getSetting<any[]>('screens');

        let selection:boolean = false;
        for(let index = 0, length = settings.screens.length; index < length; index++) {
            let screen:SettingsScreen = settings.screens[index];
            screen.index = index;
            screen.selected = settings.screen === index;

            selection = true;
        }
        if(!selection && settings.screens.length > 1) {
            settings[0].selected = true;
            settings.screen = 0;
        }
    }
}