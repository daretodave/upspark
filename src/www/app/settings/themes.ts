import {Theme} from "./theme";
import {ThemePalette} from "../../../app/window/theme-palette";

const DEFAULT_THEME = new Theme('', '', new ThemePalette('black', 'white', 'black'));

export class Themes {

    public selected:Theme;

    constructor(public themes: Theme[]) {
        this.selected = DEFAULT_THEME;

    }

    select(themeName: string) {
        this.themes.forEach((theme:Theme) => {
            if(theme.name === themeName) {
                this.selected = theme;
                theme.selected = true;
            } else {
                theme.selected = false;
            }
        });
    }
}