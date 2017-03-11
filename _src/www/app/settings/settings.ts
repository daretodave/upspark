import {SettingsScreen} from "./settings-screen";
export class Settings {
    width:number;
    height:number;
    x:number;
    y:number;
    offsetX:number;
    offsetY: number;
    screen:number;
    hotkeyModifier:string;
    hotkey:string;
    rotation:number;
    screens:SettingsScreen[];
    resourceLocation:string;
    alwaysOnTop:boolean;

    getHotkey(): string {
        if(!this.hotkey) {
            return '';
        }
        let resolve:string = '';
        if(this.hotkeyModifier === 'Control' || this.hotkey === 'Command') {
            resolve += (this.hotkeyModifier + '+');
        }
        resolve += this.hotkey;
        return resolve;
    }
}