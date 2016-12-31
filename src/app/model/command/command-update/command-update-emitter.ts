import {CommandUpdate} from "./command-update";
import {Logger} from "../../logger/logger";
import {CommandLike} from "../command-like";
import {CommandUpdateListener} from "./command-update-listener";

export class CommandUpdateEmitter {

    public id:string;
    public updateListener: CommandUpdateListener;
    public completed: boolean;

    public update(message: (CommandLike | CommandUpdate), log: any = null) {

        let commandUpdate: CommandUpdate;
        if (message instanceof CommandUpdate) {
            commandUpdate = message;
            commandUpdate.id = this.id;
        } else {
            commandUpdate = CommandUpdate.fromCommandLike(
                this.id,
                message
            );
        }

        if(!this.completed && commandUpdate.completed === true) {
            this.completed = true;
        }

        if (log !== null || this.updateListener === null) {
            if (Array.isArray(log)) {
                Logger.log.apply(Logger, [commandUpdate.error].concat(log));
            } else if (typeof log === 'boolean' || this.updateListener === null) {
                Logger.log(commandUpdate.error, commandUpdate);
            } else {
                Logger.log(commandUpdate.error, log);
            }
        }

        if (this.updateListener !== null) {
            this.updateListener.onCommandUpdate(commandUpdate);
        }

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

export namespace CommandUpdateEmitter {
    
    export const BROKEN_EMITTER: CommandUpdateEmitter = new CommandUpdateEmitter();
    
}