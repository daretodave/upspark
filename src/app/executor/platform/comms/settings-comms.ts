import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
import {Settings} from "../../../window/runner/settings";
import {RunnerStyle} from "../../../window/runner-style";
export class SettingsComms extends PlatformCommsHandler {

    constructor(host: Host) {
        super(host, 'Settings');
    }

    init() {
        this.add('reload', SettingsComms.reload);

        this.add('setGlobalCustomCSS', SettingsComms.setGlobalCustomCSS);
        this.add('setRunnerCustomCSS', SettingsComms.setRunnerCustomCSS);
        this.add('setGlobalTheme', SettingsComms.setGlobalTheme);
        this.add('setRunnerTheme', SettingsComms.setRunnerTheme);
        this.add('setHotkey', SettingsComms.setHotkey, {
            hotkey: 'E.G \'Control+`\' or \'A\''
        });

        this.add('setRotation', SettingsComms.setRotation);
        this.add('setSize', SettingsComms.setSize);
        this.add('setWidth', SettingsComms.setWidth);
        this.add('setHeight', SettingsComms.setHeight);
        this.add('setLocation', SettingsComms.setLocation);
        this.add('setScreen', SettingsComms.setScreen);
        this.add('setX', SettingsComms.setX);
        this.add('setY', SettingsComms.setY);
        this.add('setOffsetX', SettingsComms.setOffsetX);
        this.add('setOffsetY', SettingsComms.setOffsetY);

        this.add('getSettings', SettingsComms.get);
        this.add('getGlobalCustomCSS', SettingsComms.getGlobalCustomCSS);
        this.add('getRunnerCustomCSS', SettingsComms.getRunnerCustomCSS);
        this.add('getRotation', SettingsComms.getRotation);
        this.add('getHotkey', SettingsComms.getHotkey);
        this.add('getGlobalTheme', SettingsComms.getGlobalTheme);
        this.add('getRunnerTheme', SettingsComms.getRunnerTheme);
        this.add('getSize', SettingsComms.getSize);
        this.add('getWidth', SettingsComms.getWidth);
        this.add('getHeight', SettingsComms.getHeight);
        this.add('getLocation', SettingsComms.getLocation);
        this.add('getScreen', SettingsComms.getScreen);
        this.add('getX', SettingsComms.getX);
        this.add('getY', SettingsComms.getY);
        this.add('getOffsetX', SettingsComms.getOffsetX);
        this.add('getOffsetY', SettingsComms.getOffsetY);
    }

    static reload(host: Host,
                  args: any,
                  resolve: (message?: any) => any,
                  reject: (message?: string, syntax?: boolean) => any) {
        host.reloadSettings()
            .then(() => resolve(true))
            .catch((error: any) => reject(error));
    }

    static get(host: Host) {
        return host.resources().syncGet<Settings>('settings');
    }

    static getGlobalCustomCSS(host: Host) {
        return host.resources().syncGet<RunnerStyle>('global-style').content;
    }

    static setGlobalCustomCSS(host: Host,
                              css: string,
                              resolve: (message?: any) => any,
                              reject: (message?: string, syntax?: boolean) => any) {

        css = css || "";

        host.resources().syncGet<RunnerStyle>('global-style').content = css;

        host.adhereSettings().then(_ => resolve(true));
    }

    static getRunnerCustomCSS(host: Host) {
        return host.resources().syncGet<RunnerStyle>('runner-style').content;
    }

    static setRunnerCustomCSS(host: Host,
                              css: any,
                              resolve: (message?: any) => any,
                              reject: (message?: string, syntax?: boolean) => any) {

        css = css || "";

        host.resources().syncGet<RunnerStyle>('runner-style').content = css;

        host.adhereSettings().then(_ => resolve(true));
    }

    static getRotation(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.rotation;
    }

    static setRotation(host: Host, value: any, resolve: (message?: any) => any,
                       reject: (message?: string, syntax?: boolean) => any) {
        value = value || 0;
        value = parseFloat(value);

        host.resources().syncGet<Settings>('settings').rotation = value;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getHotkey(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.hotkey;
    }

    static setHotkey(host: Host, hotkey: any, resolve: (message?: any) => any,
                     reject: (message?: string, syntax?: boolean) => any) {
        if (!hotkey) {
            reject('Provide the hotkey to use to toggle the runner.', true);
            return;
        }

        host.resources().syncGet<Settings>('settings').hotkey = hotkey;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getGlobalTheme(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.theme.global;
    }

    static setGlobalTheme(host: Host,
                          theme: string,
                          resolve: (message?: any) => any,
                          reject: (message?: string, syntax?: boolean) => any) {

        theme = theme || "";

        host.resources().syncGet<Settings>('settings').theme.global = theme;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getRunnerTheme(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.theme.runner;
    }

    static setRunnerTheme(host: Host,
                          theme: string,
                          resolve: (message?: any) => any,
                          reject: (message?: string, syntax?: boolean) => any) {

        theme = theme || "";

        host.resources().syncGet<Settings>('settings').theme.runner = theme;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getSize(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.size;
    }

    static setSize(host: Host, size: any, resolve: (message?: any) => any,
                   reject: (message?: string, syntax?: boolean) => any) {
        size.w = size.w || 1;
        size.h = size.h || .3;

        size.w = parseFloat(size.w);
        size.h = parseFloat(size.h);

        host.resources().syncGet<Settings>('settings').size = {
            width: size.w,
            height: size.h
        };

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getWidth(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.size.width;
    }

    static setWidth(host: Host, value: any, resolve: (message?: any) => any,
                    reject: (message?: string, syntax?: boolean) => any) {
        value = value || 1;
        value = parseFloat(value);

        host.resources().syncGet<Settings>('settings').size.width = value;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getHeight(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.size.height;
    }

    static setHeight(host: Host, value: any, resolve: (message?: any) => any,
                     reject: (message?: string, syntax?: boolean) => any) {
        value = value || .3;
        value = parseFloat(value);

        host.resources().syncGet<Settings>('settings').size.height = value;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getLocation(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return {
            x: settings.location.x,
            y: settings.location.y
        };
    }

    static setLocation(host: Host, location: any, resolve: (message?: any) => any,
                       reject: (message?: string, syntax?: boolean) => any) {

        location.x = location.x || 0;
        location.y = location.y || 0;

        location.x = parseFloat(location.x);
        location.y = parseFloat(location.y);

        let settings: Settings = host.resources().syncGet<Settings>('settings');

        settings.location.x = location.x;
        settings.location.y = location.y;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getScreen(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.location.screen;
    }

    static setScreen(host: Host, value: any, resolve: (message?: any) => any,
                     reject: (message?: string, syntax?: boolean) => any) {
        value = value || 0;
        value = parseFloat(value);

        host.resources().syncGet<Settings>('settings').location.screen = value;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getX(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.location.x;
    }

    static setX(host: Host, value: any, resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {
        value = value || 0;
        value = parseFloat(value);

        host.resources().syncGet<Settings>('settings').location.x = value;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getY(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.location.y;
    }

    static setY(host: Host, value: any, resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {
        value = value || 0;
        value = parseFloat(value);

        host.resources().syncGet<Settings>('settings').location.y = value;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getOffsetX(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.location.offsetX;
    }

    static setOffsetX(host: Host, value: any, resolve: (message?: any) => any,
                      reject: (message?: string, syntax?: boolean) => any) {
        value = value || 0;
        value = parseFloat(value);

        host.resources().syncGet<Settings>('settings').location.offsetX = value;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }

    static getOffsetY(host: Host) {
        let settings: Settings = host.resources().syncGet<Settings>('settings');
        return settings.location.offsetY;
    }

    static setOffsetY(host: Host, value: any, resolve: (message?: any) => any,
                      reject: (message?: string, syntax?: boolean) => any) {
        value = value || 0;
        value = parseFloat(value);

        host.resources().syncGet<Settings>('settings').location.offsetY = value;

        host.adhereSettings().then(_ => resolve(true)).catch(error => reject(error));
    }


}