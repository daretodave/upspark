import {Platform} from "./platform";
import {CommandIntent} from "../../model/command/command-intent";
import {CommandUpdateHandler} from "../../model/command/command-update-handler";
import {CommandUpdate} from "../../model/command/command-update";
import {Commandable} from "../../model/command/commandable";
import {CommandUpdateMessage} from "../../model/command/command-update-message";
import {Logger} from "../../system/logger/logger";
export class PlatformExecutorTask {

    private completed:boolean = false;

    constructor(public platform: Platform,
                public id: string,
                public intent: CommandIntent,
                private handler: CommandUpdateHandler) {
    }

    public isCompleted():boolean {
        return this.completed;
    }

    public postUpdate(commandUpdate: CommandUpdate, log:any = null): PlatformExecutorTask {

        if(log !== null) {
            if(Array.isArray(log)) {
                Logger.log.apply(Logger, [commandUpdate.error].concat(log));
            } else if(typeof log === 'boolean') {
                Logger.log(commandUpdate.error, commandUpdate);
            } else {
                Logger.log(commandUpdate.error, log);
            }
        }

        let message:CommandUpdateMessage = commandUpdate.asMessage(this.intent);
        if (!this.completed && message.update.completed) {
            this.completed = true;
        }

        this.handler.onCommandUpdate(message);

        return this;
    }

    public update(message:Commandable, log:any = null): PlatformExecutorTask {
        return this.postUpdate(
            CommandUpdate.fromCommandLike(
                this.id,
                message
            ),
            log
        );

    }

    public complete(message:any = null, error:boolean = false, log:any = null): PlatformExecutorTask {
        return this.postUpdate(CommandUpdate.completed(
            this.id,
            error,
            message
        ), log);
    }

    public error(message: any = null, log:any = true): PlatformExecutorTask {
        if(log !== null && typeof log === 'boolean') {
            log = message;
        }

        return this.complete(
            message,
            true,
            log
        );
    }
}