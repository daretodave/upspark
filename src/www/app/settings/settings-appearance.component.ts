import {Component, OnInit} from '@angular/core';
import {Themes} from "./themes";
import {ThemeService} from "./theme.service";

require('./settings-appearance.component.scss');

@Component({
    selector: 'up-settings-appearance',
    templateUrl: './settings-appearance.component.html'
})
export class SettingsAppearanceComponent implements OnInit {

    private global:Themes;
    private runner:Themes;

    constructor(private themes:ThemeService) {
    }

    ngOnInit() {
        this.global = this.themes.getThemes('global');
        this.runner = this.themes.getThemes('runner');
    }

}