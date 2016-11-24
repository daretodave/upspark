import {ThemePalette} from "./theme-palette";

export class Theme {

    constructor(
        public name: string,
        public description: string,
        public location: string,
        public palette:ThemePalette) {
    }

}