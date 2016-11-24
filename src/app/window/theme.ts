import {ThemePalette} from "./theme-palette";
const fs = require('fs');

export class Theme {


    constructor(public name: string, public description: string, public location: string, public palette:ThemePalette) {
    }

    read(): Promise<string> {
        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
            fs.readFile(this.location, 'utf8', (err: NodeJS.ErrnoException, data: string) => {
                if(err != null) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        };
        return new Promise<string>(executor);
    }

}