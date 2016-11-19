import {Component, OnInit, NgZone} from '@angular/core';
import {SettingsService} from "./settings.service";
import {Settings} from "./settings";
import {SettingsScreen} from "./settings-screen";

const {ipcRenderer} = require('electron');

require('./settings-general.component.scss');

@Component({
    selector: 'up-settings-general',
    templateUrl: './settings-general.component.html'
})
export class SettingsGeneralComponent implements OnInit{

    private settings:Settings;

    constructor(private settingsService:SettingsService, private zone:NgZone) {
        this.settings = new Settings();
    }

    ngOnInit() {
        this.settingsService.setSettings(this.settings);

        ipcRenderer.removeAllListeners('display-updated');

        ipcRenderer.on('display-updated', () => {
            console.log('system.displays updated');
            this.zone.run(() => {
                this.settingsService.setScreens(this.settings);
            });
        });
    }

    openResourceDirectory() {
        ipcRenderer.send('open-resources');
    }

    onScreenUpdate(screenIdx:number) {
        this.settings.screens.forEach((screen:SettingsScreen) => {
           screen.selected = screen.index === screenIdx;
        });
        this.settings.screen = screenIdx;

        this.settingsService.setSetting('screen', screenIdx, true);

    }

    onWidthUpdate(width:number) {
        this.settingsService.setSetting('width', width);
    }
    onWidthUpdateFinal(width:number) {
        this.settingsService.setSetting('width', width, true);

        this.settings.width = width;
    }

}