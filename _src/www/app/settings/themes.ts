import {Theme} from "./theme";

export class Themes {

    public selected:Theme;

    constructor(public targeted:string, public themes: Theme[]) {
        this.selected = null;
    }

    select(themeName: string) {
        let found:boolean = false;
        this.themes.forEach((theme:Theme) => {
            if(theme.name === themeName) {
                this.selected = theme;
                theme.selected = true;
                found = true;
            } else {
                theme.selected = false;
            }
        });
        if(!found) {
            this.selected = null;
        }
    }
}