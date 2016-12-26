import {CommandUpdate} from "./command-update";
import {Logger} from "../../../system/logger/logger";
import {CommandLike} from "../command-like";
import {CommandUpdateListener} from "./command-update-listener";

export class CommandUpdateEmitter {

    public id:string;
    public updateListener: CommandUpdateListener;

    public update(message: (CommandLike | CommandUpdate), log: any = null) {

        let commandUpdate: CommandUpdate;
        if (message instanceof CommandUpdate) {
            commandUpdate = message;
        } else {
            commandUpdate = CommandUpdate.fromCommandLike(
                this.id,
                message
            );

        }

        if (log !== null) {
            if (Array.isArray(log)) {
                Logger.log.apply(Logger, [commandUpdate.error].concat(log));
            } else if (typeof log === 'boolean') {
                Logger.log(commandUpdate.error, commandUpdate);
            } else {
                Logger.log(commandUpdate.error, log);
            }
        }

        this.updateListener.onCommandUpdate(commandUpdate);

        return this;
    }

    public complete(message: any = null, error: boolean = false, response: boolean = false, log: any = null) {
        return this.update(CommandUpdate.completed(
            this.id,
            error,
            message,
            response
        ), log);
    }

    public error(message: any = null, response: boolean = false, log: any = true):any {
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

