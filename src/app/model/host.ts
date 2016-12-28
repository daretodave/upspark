import {Resource} from "./resource/resource";
import {Safe} from "./safe";
import {Platform} from "../executor/platform/platform";
import {PlatformExecutor} from "../executor/platform/platform-executor";
import {CommandRuntime} from "./command/command-runtime";
import {Executor} from "../executor/executor";
import {InternalCommandExecutor} from "../executor/internal/internal-command-executor";
import {CommandTask} from "./command/command-task";
export class Host {
    
    private _resources:Resource;
    private _safe:Safe;
    private _platform:Platform;
    private _executor = new Map<CommandRuntime, Executor>();
    
    constructor() {
        this._executor.set(CommandRuntime.INTERNAL, new InternalCommandExecutor());
        this._executor.set(CommandRuntime.PLATFORM, new PlatformExecutor());
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