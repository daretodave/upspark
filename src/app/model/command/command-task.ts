import {CommandUpdateEmitter} from "./command-update/command-update-emitter";
import {CommandUpdateListener} from "./command-update/command-update-listener";
import {CommandLike} from "./command-like";
import {CommandUpdate} from "./command-update/command-update";
import {Util} from "../../api/util";
import {Command} from "./command";
import {CommandTaskListener} from "./command-task-listener";
import {Platform} from "../../api/platform/platform";

export class CommandTask implements CommandUpdateEmitter {

    private commandName:string;


    constructor(public command: Command,
                public platform: Platform,
                public listener: CommandTaskListener) {
        this.commandName = this.command.intent.command.trim();

    }

    get id(): string {
        return this.command.id;
    }

    get updateListener(): CommandUpdateListener {
        return this.listener;
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