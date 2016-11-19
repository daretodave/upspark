import {Component, OnInit, NgZone, ElementRef, ViewChild, AfterViewInit, Renderer} from '@angular/core';
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
    @ViewChild('heightSlider') heightSlider: SliderComponent;
    @ViewChild('xSlider') xSlider: SliderComponent;
    @ViewChild('ySlider') ySlider: SliderComponent;
    @ViewChild('offsetXSlider') offsetXSlider: SliderComponent;
    @ViewChild('offsetYSlider') offsetYSlider: SliderComponent;
    @ViewChild('demoRunner') demoRunner: ElementRef;

    constructor(private settingsService:SettingsService, private zone:NgZone, private renderer: Renderer) {
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

    updateDemoRunner() {
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'left', `${this.settings.x * 100}%`);
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'top', `${this.settings.y * 100}%`);
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'transform', `translateX(${this.settings.offsetX * 100}%) translateY(${this.settings.offsetY * 100}%)`);
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'width', `${this.settings.width * 100}%`);
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'height', `${this.settings.height * 100}%`);
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

            onUpdate.call(self, value);
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
            self.settings[metric] = value;
            self.updateDemoRunner.call(self);
        };
    }

    private onWidthInput:(value:any) => void;
    private onWidthUpdate:(value:number) => void;
    private onWidthUpdateFinal:(value:number) => void;

    private onHeightInput:(value:any) => void;
    private onHeightUpdate:(value:number) => void;
    private onHeightUpdateFinal:(value:number) => void;

    private onXInput:(value:any) => void;
    private onXUpdate:(value:number) => void;
    private onXUpdateFinal:(value:number) => void;

    private onYInput:(value:any) => void;
    private onYUpdate:(value:number) => void;
    private onYUpdateFinal:(value:number) => void;

    private onOffsetXInput:(value:any) => void;
    private onOffsetXUpdate:(value:number) => void;
    private onOffsetXUpdateFinal:(value:number) => void;

    private onOffsetYInput:(value:any) => void;
    private onOffsetYUpdate:(value:number) => void;
    private onOffsetYUpdateFinal:(value:number) => void;

    ngAfterViewInit() {

        this.onWidthUpdate = this.onMetricUpdate('width');
        this.onWidthUpdateFinal = this.onMetricUpdate('width', true);
        this.onWidthInput = this.onSliderInput(this.onWidthUpdateFinal, this.widthSlider);

        this.onHeightInput = this.onMetricUpdate('height');
        this.onHeightUpdateFinal = this.onMetricUpdate('height', true);
        this.onHeightUpdate = this.onSliderInput(this.onHeightUpdateFinal, this.heightSlider);

        this.onXInput = this.onMetricUpdate('x');
        this.onXUpdateFinal = this.onMetricUpdate('x', true);
        this.onXUpdate = this.onSliderInput(this.onXUpdateFinal, this.xSlider);

        this.onYInput = this.onMetricUpdate('y');
        this.onYUpdateFinal = this.onMetricUpdate('y', true);
        this.onYUpdate = this.onSliderInput(this.onYUpdateFinal, this.ySlider);

        this.onOffsetXInput = this.onMetricUpdate('offset-x', false, 'offsetX');
        this.onOffsetXUpdateFinal = this.onMetricUpdate('offset-x', true, 'offsetX');
        this.onOffsetXUpdate = this.onSliderInput(this.onOffsetXUpdateFinal, this.offsetXSlider);

        this.onOffsetYInput = this.onMetricUpdate('offset-y', false, 'offsetY');
        this.onOffsetYUpdateFinal = this.onMetricUpdate('offset-y', true, 'offsetY');
        this.onOffsetYUpdate = this.onSliderInput(this.onOffsetYUpdateFinal, this.offsetYSlider);

        this.updateDemoRunner();
    }

}