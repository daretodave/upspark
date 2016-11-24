import {Theme} from "./theme";
const themes: any = require('../config/themes.json');

export class Themes {

    static get(key: string): Theme[] {
       return themes[key];
    }

    static load(key: string, themeName: string): Promise<string> {
        let themes: Theme[] = Themes.get(key);
        let selected: Theme = themes.find((theme:Theme) => theme.name === themeName);

        if(selected != null) {
            return selected.read();
        }

        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
            resolve('')
        };
        return new Promise<string>(executor);

    }
}