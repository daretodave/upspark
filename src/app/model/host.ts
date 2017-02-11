import {Resource} from "./resource/resource";
import {Safe} from "./safe";
import {Platform} from "../executor/platform/platform";
import {PlatformExecutor} from "../executor/platform/platform-executor";
import {CommandRuntime} from "./command/command-runtime";
import {Executor} from "../executor/executor";
import {InternalCommandExecutor} from "../executor/internal/internal-command-executor";
import {CommandTask} from "./command/command-task";
import {SystemCommandExecutor} from "../executor/system/system-command-executor";
export class Host {
    
    private _resources:Resource;
    private _safe:Safe;
    private _platform:Platform;
    private _executor = new Map<CommandRuntime, Executor>();
    private _cwd:string;
    private _defaultCWD:string;
    private _cwdUpdateCallback: (cwd:string) => any;
    
    constructor() {
        this._executor.set(CommandRuntime.INTERNAL, new InternalCommandExecutor());
        this._executor.set(CommandRuntime.PLATFORM, new PlatformExecutor());
        this._executor.set(CommandRuntime.SYSTEM, new SystemCommandExecutor(CommandRuntime.SYSTEM));
        this._executor.set(CommandRuntime.BASH, new SystemCommandExecutor(CommandRuntime.BASH));
        this._executor.set(CommandRuntime.BASH_EXTERNAL, new SystemCommandExecutor(CommandRuntime.BASH_EXTERNAL));
    }

    setDefaultCWD(cwd:string, updateCallback: (cwd:string) => any) {
        this._defaultCWD = cwd;
        this._cwd = cwd;
        this._cwdUpdateCallback = updateCallback;
    }

    toDefaultCWD(): string {
        return this.cwd(this._defaultCWD);
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
    
    execute(task:CommandTask) {
        this.executor(task.digest.runtime).execute(task);
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