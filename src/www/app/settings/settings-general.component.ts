import {Component, OnInit, NgZone, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {SettingsService} from "./settings.service";
import {Settings} from "./settings";
import {SettingsScreen} from "./settings-screen";
import {SliderComponent} from "../shared/slider/slider.component";

const {ipcRenderer} = require('electron');

require('./settings-general.component.scss');

@Component({
    selector: 'up-settings-general',
    templateUrl: './settings-general.component.html'
})
export class SettingsGeneralComponent implements OnInit, AfterViewInit {


    private settings:Settings;
    private mockSettings:Settings;

    @ViewChild('widthSlider') widthSlider: SliderComponent;

    constructor(private settingsService:SettingsService, private zone:NgZone, private el: ElementRef) {
        this.settings = new Settings();
        this.mockSettings = new Settings();
    }

    ngOnInit() {
        this.settingsService.setSettings(this.settings);

        this.mockSettings.width = this.getSafeMetric(this.settings.width);
        this.mockSettings.height = this.getSafeMetric(this.settings.height);
        this.mockSettings.offsetX = this.getSafeMetric(this.settings.offsetX);
        this.mockSettings.offsetY = this.getSafeMetric(this.settings.offsetY);
        this.mockSettings.x = this.getSafeMetric(this.settings.x);
        this.mockSettings.y = this.getSafeMetric(this.settings.y);

        ipcRenderer.removeAllListeners('display-updated');

        ipcRenderer.on('display-updated', () => {
            console.log('system.displays updated');
            this.zone.run(() => {
                this.settingsService.setScreens(this.settings);
            });
        });
    }

    getSafeMetric(value:number): number {
        value = value*1;
        return +value.toFixed(2);
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

    static getNumber(value:any):number {
        if(isNaN(value) || !isFinite(value)) {
            return undefined;
        }

        let num:number = +value;
        if(num < 0 || num > 1) {
            return undefined;
        }

        return num;
    }

    onSliderInput(onUpdate:(num:number) => void, slider:SliderComponent) {
        let self:SettingsGeneralComponent = this;
        return (value:any) => {
            let num:number = SettingsGeneralComponent.getNumber(value);
            if(num === undefined) {
                return;
            }

            onUpdate.call(self, [value]);
            slider.setBallLocation(num);
        };
    }

    onMetricUpdate(setting:string, save:boolean = false, metric:string = setting) {
        let self:SettingsGeneralComponent = this;
        return (value:number) => {
            self.settingsService.setSetting(setting, value, save);
            if(self.mockSettings[metric] !== value) {
                self.mockSettings[metric] = self.getSafeMetric(value);
            }
        };
    }

    private onWidthInput:(value:any) => void;
    private onWidthUpdate:(value:number) => void;
    private onWidthUpdateFinal:(value:number) => void;

    ngAfterViewInit() {

        this.onWidthUpdate = this.onMetricUpdate('width');
        this.onWidthUpdateFinal = this.onMetricUpdate('width', true);
        this.onWidthInput = this.onSliderInput(this.onWidthUpdateFinal, this.widthSlider);


    }

}