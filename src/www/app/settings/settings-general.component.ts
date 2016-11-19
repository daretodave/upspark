import {Component, OnInit} from '@angular/core';
import {SettingsService} from "./settings.service";
import {Settings} from "./settings";

const {ipcRenderer} = require('electron');

require('./settings-general.component.scss');

@Component({
    selector: 'up-settings-general',
    templateUrl: './settings-general.component.html'
})
export class SettingsGeneralComponent implements OnInit{

    private settings:Settings;

    constructor(private settingsService:SettingsService) {
        this.settings = new Settings();
    }

    ngOnInit() {
        this.settingsService.setSettings(this.settings);
    }

    openResourceDirectory() {
        ipcRenderer.send('open-resources');
    }

    onWidthUpdate(width:number) {
        this.settingsService.setSetting('width', width);
    }
    onWidthUpdateFinal(width:number) {
        this.settingsService.setSetting('width', width, true);

        this.settings.width = width;
    }

}