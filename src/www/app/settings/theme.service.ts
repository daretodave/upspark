import { Injectable } from '@angular/core';
import {Themes} from "./themes";
import {SettingsService} from "./settings.service";
import {Theme} from "./theme";

const {ipcRenderer} = require('electron');

@Injectable()
export class ThemeService {


    constructor(private settings:SettingsService) {
    }

    getThemes(target:string): Themes {
        let themes:Theme[] = ipcRenderer.sendSync('get-themes', target);
        let selection:Themes = new Themes(target, themes);

        selection.select(this.settings.getSetting<string>(`theme-${target}`));

        return selection;
    }

}