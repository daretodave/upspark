import {SettingsScreen} from "./settings-screen";
export class Settings {
    width: number;
    height: number;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    screen: number;
    hotkey: string;
    rotation: number;
    screens: SettingsScreen[];
    resourceLocation: string;
    alwaysOnTop: boolean;


    get keycode():string {
        return this.getHotkey();
    }

    keycodes: string[] = [];

    isHotkeyShift:boolean;
    isHotkeyCommand:boolean;
    isHotkeyControl:boolean;
    isHotkeyAlt:boolean;
    isHotkeyOption:boolean;
    isHotkeyAltGr:boolean;
    isHotkeySuper:boolean;


    getHotkey() {
        let hotkey:any = [];

        if(this.isHotkeyCommand && this.isHotkeyControl) {
            hotkey.push("CommandOrControl");
        } else if(this.isHotkeyCommand) {
            hotkey.push("Command");
        } else if(this.isHotkeyControl) {
            hotkey.push("Control");
        }

        if(this.isHotkeyShift) {
            hotkey.push("Shift");
        }
        if(this.isHotkeyAlt) {
            hotkey.push("Alt");
        }
        if(this.isHotkeyOption) {
            hotkey.push("Option");
        }
        if(this.isHotkeyAltGr) {
            hotkey.push("AltGr");
        }
        if(this.isHotkeySuper) {
            hotkey.push("Super");
        }

        hotkey.push(...this.keycodes);

        return hotkey.join("+");
    }

}