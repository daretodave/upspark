import {Injectable} from '@angular/core';
import {Settings} from "./settings";
import {SettingsScreen} from "./settings-screen";

const {ipcRenderer} = require('electron');

@Injectable()
export class SettingsService {

    getSetting<T>(settingName: string): T {
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
        settings.alwaysOnTop = this.getSetting<boolean>('alwaysOnTop');
        settings.resourceLocation = this.getSetting<string>('resource-dir');

        this.setHotkey(settings);
        this.setScreens(settings);
    }

    setHotkey(settings: Settings) {
        let blocks: string[] = this.getSetting<string>('hotkey').split('+');

        settings.isHotkeyShift = false;
        settings.isHotkeyCommand = false;
        settings.isHotkeyControl = false;
        settings.isHotkeyAlt = false;
        settings.isHotkeyOption = false;
        settings.isHotkeyAltGr = false;
        settings.isHotkeySuper = false;
        settings.keycodes.splice(0, settings.keycodes.length);

        blocks.forEach(part => {
            let block:string = part.toUpperCase();

            if (block === "COMMANDORCONTROL"
                || block === "CMDORCTRL") {
                settings.isHotkeyCommand = true;
                settings.isHotkeyControl = true;

            } else if (block === "CMD"
                || block === "COMMAND") {
                settings.isHotkeyCommand = true;

            } else if (block === "CTRL"
                || block === "CONTROL") {

                settings.isHotkeyControl = true;
            } else if (block === "SHIFT") {

                settings.isHotkeyShift = true;
            } else if (block === "ALT") {

                settings.isHotkeyAlt = true;
            } else if (block === "OPTION") {

                settings.isHotkeyOption = true;
            } else if (block === "ALTGR") {

                settings.isHotkeyAltGr = true;
            } else if (block === "SUPER") {

                settings.isHotkeySuper = true;
            } else {

                settings.keycodes.push(part);
            }

        });
    }

    setScreens(settings: Settings) {
        settings.screens = this.getSetting<any[]>('screens');

        let selection: boolean = false;
        for (let index = 0, length = settings.screens.length; index < length; index++) {
            let screen: SettingsScreen = settings.screens[index];
            screen.index = index;
            screen.selected = settings.screen === index;

            selection = true;
        }
        if (!selection && settings.screens.length > 1) {
            settings[0].selected = true;
            settings.screen = 0;
        }
    }
}