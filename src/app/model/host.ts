import {Resource} from "./resource/resource";
import {Safe} from "./safe";
import {Platform} from "../executor/platform/platform";
import {PlatformExecutor} from "../executor/platform/platform-executor";
import {CommandRuntime} from "./command/command-runtime";
import {Executor} from "../executor/executor";
import {InternalCommandExecutor} from "../executor/internal/internal-command-executor";
import {CommandTask} from "./command/command-task";
import {SystemCommandExecutor} from "../executor/system/system-command-executor";
import {EnvMap} from "./env-map";
import {PlatformCommsHandler} from "../executor/platform/platform-comms-handler";
import {PlatformComms} from "../executor/platform/platform-comms";
import {Logger} from "./logger/logger";

const generatedUUID = require('uuid/v1');

export class Host {
    
    private _resources:Resource;
    private _safe:Safe;
    private _platform:Platform;
    private _executor = new Map<CommandRuntime, Executor>();
    private _cwd:string;
    private _env:EnvMap = {};
    private _defaultCWD:string;
    private _cwdUpdateCallback: (cwd:string) => any;

    private _settingsWindow:any;
    private _runnerWindow:any;
    private _safeWindow:any;

    private _reloadSettings: () => Promise<any>;
    private _reloadTheme: () => Promise<any>;
    private _reload: () => Promise<any>;
    private _messages: any;

    private _comms: PlatformComms;

    constructor(
        reload:() => Promise<any>,
        reloadTheme:() => Promise<any>,
        reloadSettings:() => Promise<any>
    ) {
        this._messages = {};
        this._reload = reload;
        this._reloadTheme = reloadTheme;
        this._reloadSettings = reloadSettings;

        this._executor.set(CommandRuntime.INTERNAL, new InternalCommandExecutor());
        this._executor.set(CommandRuntime.PLATFORM, new PlatformExecutor());
        this._executor.set(CommandRuntime.SYSTEM, new SystemCommandExecutor(CommandRuntime.SYSTEM));
        this._executor.set(CommandRuntime.BASH, new SystemCommandExecutor(CommandRuntime.BASH));
        this._executor.set(CommandRuntime.BASH_EXTERNAL, new SystemCommandExecutor(CommandRuntime.BASH_EXTERNAL));

        this._comms = new PlatformComms(this);
    }

    isRunnerWindowVisible(): boolean {
        return this._runnerWindow.isVisible()
    }

    showRunnerWindow() {
        this._runnerWindow.show();
    }

    toggleRunnerWindow() {
        if(this._runnerWindow.isVisible()) {
            this._runnerWindow.hide();
        } else {
            this._runnerWindow.show();
            this._runnerWindow.focus();
        }
    }

    getInternalCommands(): string[] {
        return (<InternalCommandExecutor>this._executor.get(CommandRuntime.INTERNAL)).getCommands();
    }

    reload(): Promise<any> {
        return this._reload();
    }

    reloadTheme(): Promise<any> {
        return this._reloadTheme();
    }

    reloadSettings(): Promise<any> {
        return this._reloadSettings();
    }

    setDefaultCWD(cwd:string, updateCallback: (cwd:string) => any) {
        this._defaultCWD = cwd;
        this._cwd = cwd;
        this._cwdUpdateCallback = updateCallback;
    }

    toDefaultCWD(): string {
        return this.cwd(this._defaultCWD);
    }

    getENV():EnvMap {
        return this._env;
    }

    setENV(key:string, value:string):Host {
        this._env[key] = value;
        return this;
    }

    attachRunnerWindow(runnerWindow:any) {
        this._runnerWindow = runnerWindow;
    }

    attachSettingsWindow(settingsWindow:any) {
        this._settingsWindow = settingsWindow;
    }

    attachSafeWindow(safeWindow:any) {
        this._safeWindow = safeWindow;
    }

    handleMessage(id:string, message:any, error:boolean) {

        Logger.log(error, `system message from ${id}`);
        Logger.log(error, message);

        if(!this._messages.hasOwnProperty(id)) {
            Logger.error(`subscriber for system message ${id} could not be found`);
            return;
        }

        if(error) {
            this._messages[id].reject(message);
        } else {
            this._messages[id].resolve(message);
        }
    }

    sendRunnerRequest(command:string, ...args:any[]): Promise<any> {
        return this.sendMessage(this._runnerWindow.webContents, command, ...args);
    }

    sendMessage(sender:any, command:string, ...args:any[]): Promise<any> {
        let id:string = generatedUUID();

        let executor = (resolve: (value?: any) => void, reject: (reason?: any) => void) => {

            this._messages[id] = {
                id, resolve, reject
            };

            sender.send(command, id, ...args);
        };

        return new Promise<any>(executor);
    }

    sendSafeMessage(message:string, ...args:any[]) {
        return this._safeWindow.webContents.send.apply(
            this._safeWindow.webContents,
            [message].concat(args)
        );
    }
    sendSettingsMessage(message:string, ...args:any[]) {
        return this._settingsWindow.webContents.send.apply(
            this._settingsWindow.webContents,
            [message].concat(args)
        );
    }
    sendRunnerMessage(message:string, ...args:any[]) {
        return this._runnerWindow.webContents.send.apply(
            this._runnerWindow.webContents,
            [message].concat(args)
        );
    }

    clearRunnerWindow() {
        this._runnerWindow.webContents.send('clear-tasks');
    }

    endAllTasks() {
        this._runnerWindow.webContents.send('end-tasks');
    }

    openDEVToolsForRunner() {
        this._runnerWindow.webContents.openDevTools();
    }

    hideRunnerWindow() {
        this._runnerWindow.hide();
    }

    openSettingsWindow() {
        this._settingsWindow.show();
    }

    openSafeWindow() {
        this._safeWindow.show();
    }

    cwd(cwd:string = null): string {
        if(cwd !== null) {
            this._cwd = cwd;

            if(this._cwdUpdateCallback) {
                let updatedCWD: string = this._cwd === this._defaultCWD ? '' : this._cwd;

                this._cwdUpdateCallback(updatedCWD);
            }

        }
        return this._cwd;
    }

    getPlatformCOMMS(): PlatformComms {
        return this._comms;
    }
    
    execute(task:CommandTask) {
        this.executor(task.digest.runtime).execute(task);
    }

    message(task:CommandTask, id:string, type:CommandRuntime, message:string) {
        this.executor(type).message(task, id, message);
    }

    cancel(task:CommandTask, id:string, type:CommandRuntime) {
        this.executor(type).cancel(task, id);
    }

    executor(runtime:CommandRuntime):Executor {
        return this._executor.get(runtime);
    }
    
    resources(resources:Resource = null):Resource {
        if(resources !== null) {
            this._resources = resources;
        }
        return this._resources;
    }
    
    safe(safe:Safe = null): Safe {
        if(safe !== null) {
            this._safe = safe;
        }
        return this._safe;
    }
    
    platform(platform:Platform = null): Platform {
        if(platform !== null) {
            this._platform = platform;
        }
        return this._platform;
    }
    
}