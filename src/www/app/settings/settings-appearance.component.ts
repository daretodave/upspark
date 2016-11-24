import {Component, OnInit} from '@angular/core';
import {Themes} from "./themes";
import {ThemeService} from "./theme.service";
import {SettingsService} from "./settings.service";

require('./settings-appearance.component.scss');

@Component({
    selector: 'up-settings-appearance',
    templateUrl: './settings-appearance.component.html'
})
export class SettingsAppearanceComponent implements OnInit {

    private global:Themes;
    private runner:Themes;

    constructor(private themes:ThemeService, private settings:SettingsService) {
    }

    ngOnInit() {
        this.global = this.themes.getThemes('global');
        this.runner = this.themes.getThemes('runner');
    }

    select(themes:Themes, selection:string) {
        if(themes.selected !== null && themes.selected.name === selection) {
            return;
        }
        themes.select(selection);

        this.settings.setSetting(`theme-${themes.targeted}`, selection, true);
    }

}