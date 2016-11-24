import {ThemePalette} from "../../../app/window/theme-palette";
export class Theme {

    constructor(public name: string, public description: string, palette:ThemePalette) {
    }

    public selected:boolean;

}