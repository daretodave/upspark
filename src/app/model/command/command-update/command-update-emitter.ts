import {CommandUpdateListener} from "./command-update-listener";
import {CommandUpdate} from "./command-update";
import {Logger} from "../../../system/logger/logger";
import {CommandUpdateEvent} from "./command-update-event";
import {Commandable} from "../commandable";
import {CommandIntent} from "../command-intent";

export class CommandUpdateCommunicator {

    private completed: boolean = false;

    constructor(public id: string,
                public intent: CommandIntent,
                public handler: CommandUpdateListener) {
    }

    public isCompleted(): boolean {
        return this.completed;
    }

    public postUpdate(commandUpdate: CommandUpdate, log: any = null): CommandUpdateCommunicator {

        if (log !== null) {
            if (Array.isArray(log)) {
                Logger.log.apply(Logger, [commandUpdate.error].concat(log));
            } else if (typeof log === 'boolean') {
                Logger.log(commandUpdate.error, commandUpdate);
            } else {
                Logger.log(commandUpdate.error, log);
            }
        }

        let message: CommandUpdateEvent = commandUpdate.asMessage(this.intent);

        if (!this.completed && message.update.completed) {
            this.completed = true;
        }

        this.handler.onEmit(message);

        return this;
    }

    public update(message: Commandable, log: any = null): CommandUpdateCommunicator {
        return this.postUpdate(
            CommandUpdate.fromCommandLike(
                this.id,
                message
            ),
            log
        );

    }

    public complete(message: any = null, error: boolean = false, response: boolean = false, log: any = null): CommandUpdateCommunicator {
        return this.postUpdate(CommandUpdate.completed(
            this.id,
            error,
            message,
            response
        ), log);
    }

    public error(message: any = null, response: boolean = false, log: any = true): CommandUpdateCommunicator {
        if (log !== null && typeof log === 'boolean') {
            log = message;
        }

        return this.complete(
            message,
            true,
            response,
            log
        );
    }

}

