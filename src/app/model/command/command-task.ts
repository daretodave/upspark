import {CommandUpdateEmitter} from "./command-update/command-update-emitter";
import {CommandUpdateListener} from "./command-update/command-update-listener";
import {CommandLike} from "./command-like";
import {CommandUpdate} from "./command-update/command-update";
import {Util} from "../../api/util";
import {Command} from "./command";
import {CommandTaskListener} from "./command-task-listener";
import {Platform} from "../../executor/platform/platform";
import {CommandIntentDigest} from "./command-intent-digest";
import {Host} from "../host";

export class CommandTask implements CommandUpdateEmitter {
    
    public digest:CommandIntentDigest;
    public completed:boolean;

    constructor(public command: Command,
                public host: Host,
                public listener: CommandTaskListener) {
        this.digest = CommandIntentDigest.from(this.command.intent);
        this.completed = false;
    }

    get id(): string {
        return this.command.id;
    }

    get updateListener(): CommandUpdateListener {
        return this.listener;
    }
    
    public isCompleted(): boolean {
        return this.completed;
    }

    public update: (message: (CommandLike | CommandUpdate),
                    log?: any) => any;

    public complete: (message?: any,
                      error?: boolean,
                      response?: boolean,
                      log?: any) => any;

    public error: (message?: any,
                   response?: boolean,
                   log?: any) => any;
}


Util.compose(
    CommandTask,
    [CommandUpdateEmitter]
);