import {Theme} from "./theme";
import {LoadedTheme} from "./loaded-theme";
const themes: any = require('../config/themes.json');
const loaded: Map<string, LoadedTheme> = new Map<string, LoadedTheme>();
const fs = require('fs');
const path = require('path');

export class Themes {

    static isLoaded(target: string, value:string) {
        if(!loaded.has(target)) {
            return false;
        }
        return loaded.get(target).name === value;
    }

    static setTheme(target: string, value: string, css: string) {
        loaded.set(target, new LoadedTheme(target, value, css));
    }

    static getCSS(target: string) {
        return loaded.get(target).css;
    }

    static get(key: string): Theme[] {
       return themes[key];
    }

    static load(key: string, themeName: string): Promise<string> {

        let themes: Theme[] = Themes.get(key);
        let selected: Theme = themes.find((theme:Theme) => theme.name === themeName) || null;

        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
            if(selected === null) {
                resolve('');
                return;
            }

            fs.readFile(path.join(__dirname, selected.location), 'utf8', (err: NodeJS.ErrnoException, data: string) => {
                if(err != null) {
                    reject(err);
                    return;
                }
                resolve(data);
            });

        };

        return new Promise<string>(executor);

    }

    static has(target: string) {
        return loaded.has(target);
    }
}