import {CommandUpdateEmitter} from "./command-update/command-update-emitter";
import {CommandUpdateListener} from "./command-update/command-update-listener";
import {CommandLike} from "./command-like";
import {CommandUpdate} from "./command-update/command-update";
import {Command} from "./command";
import {CommandTaskListener} from "./command-task-listener";
import {CommandIntentDigest} from "./command-intent-digest";
import {Host} from "../host";
import {Util} from "../../util/util";

export class CommandTask implements CommandUpdateEmitter {
    
    public digest:CommandIntentDigest;
    public updateListener:CommandUpdateListener;
    public completed:boolean;
    public id:string;

    constructor(public command: Command,
                public host: Host,
                public listener: CommandTaskListener) {
        this.id = command.id;
        this.digest = CommandIntentDigest.from(this.command.intent);
        this.updateListener = listener;
        this.completed = false;
    }
    
    public isCompleted(): boolean {
        return this.completed;
    }

    public update: (message: (CommandLike | CommandUpdate),
                    log?: any) => any;

    public out: (message: any, error?: boolean, log?: any) => any;

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