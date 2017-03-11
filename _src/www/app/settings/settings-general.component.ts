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


    private settings: Settings;
    private mockSettings: Settings;

    @ViewChild('widthSlider') widthSlider: SliderComponent;
    @ViewChild('heightSlider') heightSlider: SliderComponent;
    @ViewChild('xSlider') xSlider: SliderComponent;
    @ViewChild('ySlider') ySlider: SliderComponent;
    @ViewChild('offsetXSlider') offsetXSlider: SliderComponent;
    @ViewChild('offsetYSlider') offsetYSlider: SliderComponent;
    @ViewChild('rotationSlider') rotationSlider: SliderComponent;
    @ViewChild('demoRunner') demoRunner: ElementRef;

    constructor(private settingsService: SettingsService, private zone: NgZone, private renderer: Renderer) {
        this.settings = new Settings();
        this.mockSettings = new Settings();
    }

    ngOnInit() {
        this.resetMetrics();

        ipcRenderer.removeAllListeners('display-updated');
        ipcRenderer.removeAllListeners('settings-metrics-load');
        ipcRenderer.removeAllListeners('settings-display-load');
        ipcRenderer.removeAllListeners('settings-hotkey-load');

        ipcRenderer.on('display-updated', () => {
            console.log('host.displays updated');
            this.zone.run(() => {
                this.settingsService.setScreens(this.settings);
            });
        });

        ipcRenderer.on('settings-metrics-load', () => {
            this.zone.run(() => {
                this.resetMetrics();

                this.xSlider.setValue(this.settings.x);
                this.ySlider.setValue(this.settings.y);

                this.widthSlider.setValue(this.settings.width);
                this.heightSlider.setValue(this.settings.height);

                this.offsetXSlider.setValue(this.settings.offsetX);
                this.offsetYSlider.setValue(this.settings.offsetY);

                this.rotationSlider.setValue(this.settings.rotation);

                this.updateDemoRunner();
            });
        });

        ipcRenderer.on('settings-display-load', () => {
            this.zone.run(() => {
                this.settings.screen = this.settingsService.getSetting<number>('screen');
                this.settings.alwaysOnTop = this.settingsService.getSetting<boolean>('alwaysOnTop');
                this.settingsService.setScreens(this.settings);
            });
        });

        ipcRenderer.on('settings-hotkey-load', () => {
            this.zone.run(() => {
                this.settingsService.setHotkey(this.settings);

            });
        });
    }

    removeKeycode() {
        if (this.settings.keycodes.length) {
            this.settings.keycodes.splice(this.settings.keycodes.length - 1);
        }
    }

    removeAllKeycode() {
        if (this.settings.keycodes.length) {
            this.settings.keycodes.splice(0, this.settings.keycodes.length);
        }

        this.settings.isHotkeyShift = false;
        this.settings.isHotkeyCommand = false;
        this.settings.isHotkeyControl = false;
        this.settings.isHotkeyAlt = false;
        this.settings.isHotkeyOption = false;
        this.settings.isHotkeyAltGr = false;
        this.settings.isHotkeySuper = false;

    }

    sendHotkeyUpdate() {
        this.settingsService.setSetting('hotkey', this.settings.getHotkey(), true);
    }

    handleHotkeyInput(event: KeyboardEvent) {
        let isModifier: boolean = false;

        event.preventDefault();

        let key: string = event.key;

        if (event.key === "Meta") {

            if (process.platform !== "win32") {
                this.settings.isHotkeyCommand = isModifier = true;
            } else {
                this.settings.isHotkeySuper = isModifier = true;
            }
        } else if (event.key === "Shift") {
            this.settings.isHotkeyShift = isModifier = true;
        } else if (event.key === "Control") {
            this.settings.isHotkeyControl = isModifier = true;
        } else if (event.key === "Alt") {
            this.settings.isHotkeyAlt = isModifier = true;
        } else if (event.key === "Equal") {
            key = "Plus";
        }

        if (!isModifier) {
            if(key.length === 1) {
                if(event.code.length === 1) {
                    key = event.code;
                }
                key = key.toUpperCase();
            }
            if (this.settings.keycodes.indexOf(key) === -1) {
                this.settings.keycodes.push(key);
            }

        }

        this.sendHotkeyUpdate();
    }

    resetMetrics() {
        this.settingsService.setSettings(this.settings);

        this.mockSettings.width = this.getSafeMetric(this.settings.width);
        this.mockSettings.height = this.getSafeMetric(this.settings.height);
        this.mockSettings.offsetX = this.getSafeMetric(this.settings.offsetX);
        this.mockSettings.offsetY = this.getSafeMetric(this.settings.offsetY);
        this.mockSettings.x = this.getSafeMetric(this.settings.x);
        this.mockSettings.y = this.getSafeMetric(this.settings.y);
        this.mockSettings.rotation = this.getSafeMetric(this.settings.rotation);
    }

    triggerResetHotkey() {
        ipcRenderer.send('settings-hotkey-reset');
    }

    triggerResetMetrics() {
        ipcRenderer.send('settings-metrics-reset');
    }

    triggerResetDisplay() {
        ipcRenderer.send('settings-display-reset');
    }

    updateDemoRunner() {
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'left', `${this.settings.x * 100}%`);
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'top', `${this.settings.y * 100}%`);
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'transform', `translateX(${this.settings.offsetX * 100}%) translateY(${this.settings.offsetY * 100}%) rotate(${this.settings.rotation}deg)`);
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'width', `${this.settings.width * 100}%`);
        this.renderer.setElementStyle(this.demoRunner.nativeElement, 'height', `${this.settings.height * 100}%`);
    }

    getSafeMetric(value: any): number {
        if (typeof value === 'string') {
            value = +value;
        }
        return +value.toFixed(2);
    }

    onAlwaysOnTopUpdate(alwaysOnTop: boolean) {
        this.settings.alwaysOnTop = alwaysOnTop;

        this.settingsService.setSetting('alwaysOnTop', alwaysOnTop, true);
    }

    onHotkeyIsCommand(isHotkeyCommand: boolean) {
        this.settings.isHotkeyCommand = isHotkeyCommand;

        this.sendHotkeyUpdate();
    }

    onHotkeyIsControl(isHotkeyControl: boolean) {
        this.settings.isHotkeyControl = isHotkeyControl;

        this.sendHotkeyUpdate();
    }

    onHotkeyIsAlt(isHotkeyAlt: boolean) {
        this.settings.isHotkeyAlt = isHotkeyAlt;

        this.sendHotkeyUpdate();
    }


    onHotkeyIsAltGr(isHotkeyAltGr: boolean) {
        this.settings.isHotkeyAltGr = isHotkeyAltGr;

        this.sendHotkeyUpdate();
    }


    onHotkeyIsShift(isHotkeyShift: boolean) {
        this.settings.isHotkeyShift = isHotkeyShift;

        this.sendHotkeyUpdate();
    }

    onHotkeyIsSuper(isHotkeySuper: boolean) {
        this.settings.isHotkeySuper = isHotkeySuper;

        this.sendHotkeyUpdate();
    }

    onHotkeyIsOption(isHotkeyOption: boolean) {
        this.settings.isHotkeyOption = isHotkeyOption;

        this.sendHotkeyUpdate();
    }

    onScreenUpdate(screenIdx: number) {
        this.settings.screens.forEach((screen: SettingsScreen) => {
            screen.selected = screen.index === screenIdx;
        });
        this.settings.screen = screenIdx;

        this.settingsService.setSetting('screen', screenIdx, true);

    }

    static getNumber(value: any, lower: number, upper: number): number {
        if (isNaN(value) || !isFinite(value)) {
            return undefined;
        }

        let num: number = +value;
        if (num < lower || num > upper) {
            return;
        }

        return num;
    }

    onSliderInput(onUpdate: (num: number) => void, slider: SliderComponent, lowerRange: number = 0, upperRange: number = 1) {
        let self: SettingsGeneralComponent = this;

        return (value: any) => {
            if (!value) {
                return;
            }
            let num: number = SettingsGeneralComponent.getNumber(value, lowerRange, upperRange);
            if (num === undefined) {
                return;
            }
            onUpdate.call(self, value);
            slider.setValue(value);
        };
    }

    onMetricUpdate(setting: string, save: boolean = false, metric: string = setting) {
        let self: SettingsGeneralComponent = this;
        return (value: number) => {
            self.settingsService.setSetting(setting, value, save);
            self.mockSettings[metric] = self.getSafeMetric(value);
            self.settings[metric] = value;
            self.updateDemoRunner.call(self);
        };
    }

    private onWidthInput: (value: any) => void;
    private onWidthUpdate: (value: number) => void;
    private onWidthUpdateFinal: (value: number) => void;

    private onHeightInput: (value: any) => void;
    private onHeightUpdate: (value: number) => void;
    private onHeightUpdateFinal: (value: number) => void;

    private onXInput: (value: any) => void;
    private onXUpdate: (value: number) => void;
    private onXUpdateFinal: (value: number) => void;

    private onYInput: (value: any) => void;
    private onYUpdate: (value: number) => void;
    private onYUpdateFinal: (value: number) => void;

    private onOffsetXInput: (value: any) => void;
    private onOffsetXUpdate: (value: number) => void;
    private onOffsetXUpdateFinal: (value: number) => void;

    private onOffsetYInput: (value: any) => void;
    private onOffsetYUpdate: (value: number) => void;
    private onOffsetYUpdateFinal: (value: number) => void;

    private onRotationInput: (value: any) => void;
    private onRotationUpdate: (value: number) => void;
    private onRotationUpdateFinal: (value: number) => void;

    ngAfterViewInit() {

        this.onWidthUpdate = this.onMetricUpdate('width');
        this.onWidthUpdateFinal = this.onMetricUpdate('width', true);
        this.onWidthInput = this.onSliderInput(this.onWidthUpdateFinal, this.widthSlider);

        this.onHeightUpdate = this.onMetricUpdate('height');
        this.onHeightUpdateFinal = this.onMetricUpdate('height', true);
        this.onHeightInput = this.onSliderInput(this.onHeightUpdateFinal, this.heightSlider);

        this.onXUpdate = this.onMetricUpdate('x');
        this.onXUpdateFinal = this.onMetricUpdate('x', true);
        this.onXInput = this.onSliderInput(this.onXUpdateFinal, this.xSlider);

        this.onYUpdate = this.onMetricUpdate('y');
        this.onYUpdateFinal = this.onMetricUpdate('y', true);
        this.onYInput = this.onSliderInput(this.onYUpdateFinal, this.ySlider);

        this.onRotationUpdate = this.onMetricUpdate('rotation');
        this.onRotationUpdateFinal = this.onMetricUpdate('rotation', true);
        this.onRotationInput = this.onSliderInput(this.onRotationUpdateFinal, this.rotationSlider, 0, 360);

        this.onOffsetXUpdate = this.onMetricUpdate('offset-x', false, 'offsetX');
        this.onOffsetXUpdateFinal = this.onMetricUpdate('offset-x', true, 'offsetX');
        this.onOffsetXInput = this.onSliderInput(this.onOffsetXUpdateFinal, this.offsetXSlider, -1, 1);

        this.onOffsetYUpdate = this.onMetricUpdate('offset-y', false, 'offsetY');
        this.onOffsetYUpdateFinal = this.onMetricUpdate('offset-y', true, 'offsetY');
        this.onOffsetYInput = this.onSliderInput(this.onOffsetYUpdateFinal, this.offsetYSlider, -1, 1);

        this.updateDemoRunner();
    }

}