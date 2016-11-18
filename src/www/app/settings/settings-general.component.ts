import {Component, OnInit} from '@angular/core';
import {SettingsService} from "./settings.service";

const {ipcRenderer} = require('electron');

require('./settings-general.component.scss');

@Component({
    selector: 'up-settings-general',
    templateUrl: './settings-general.component.html'
})
export class SettingsGeneralComponent implements OnInit{

    private resourceDir:string;

    constructor(private settingsService:SettingsService) {
    }

    ngOnInit() {
        this.resourceDir = this.settingsService.getSetting('resource-dir');
    }

    openResourceDirectory() {
        ipcRenderer.send('open-resources');
    }

}