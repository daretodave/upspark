import {CommandUpdate} from "./command-update";
import {Logger} from "../../../system/logger/logger";
import {CommandUpdateMessage} from "./command-update-message";
import {CommandLike} from "../command-like";
import {CommandIntent} from "../command-intent";

export class CommandUpdateCommunicator {

    private completed: boolean = false;

    constructor(public id: string,
                public intent: CommandIntent,
                public handler: (message: CommandUpdateMessage) => any) {
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

        let message: CommandUpdateMessage = commandUpdate.asMessage(this.intent);

        if (!this.completed && message.update.completed) {
            this.completed = true;
        }

        this.handler(message);

        return this;
    }

    public update(message: CommandLike, log: any = null): CommandUpdateCommunicator {
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

