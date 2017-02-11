import {Command} from "../command";
import {inspect} from "util";
import {CommandLike} from "../command-like";
import {Util} from "../../../util/util";
import {CommandLogEntry} from "../command-log-entry";

export class CommandUpdate extends Command {

    constructor(id: string,
                public messages: string[] = [],
                public errors: string[] = []) {
        super(id, null);

        this.absorb();

        this.update = Date.now();
    }

    out(message:any, error:boolean = false) {
        if(this.output == null) {
            this.output = [];
        }

        this.output.push(new CommandLogEntry(CommandUpdate.getSanitizedMessage(message, error), error ? CommandLogEntry.ERROR : CommandLogEntry.INFO));
    }


    absorb(args: any = null) {

        Object.keys(args || this).forEach((property: string) => {
            if (!(args || this).hasOwnProperty(property)
                || (args || this)[property] === null
                || typeof (args || this)[property] === 'undefined'
                || property === 'errors'
                || property === 'messages') {
                return;
            }

            if (args !== null && property === "message") {
                this.messages.push(
                    CommandUpdate.getSanitizedMessage(args[property], false)
                );
                return;
            }

            if (args !== null
                && property === "error"
                && typeof args[property] !== 'boolean') {
                this.errors.push(
                    CommandUpdate.getSanitizedMessage(args[property], false)
                );
                return;
            }

            this[property] = args === null ? null : args[property];
        });

    }

}
export namespace CommandUpdate {

    export const DEFAULT_FATAL_ERROR_MESSAGE: string
        = [].join.call([
        ':-(',
        'Something went terribly wrong when running that command.',
        'You can check the host log in the upspark directory for details.'
    ], ["<br><br>"]);
    export const DEFAULT_ERROR_MESSAGE: string = 'Something went wrong';
    export const DEFAULT_SUCCESS_MESSAGE: string = '';
    export const DEFAULT_ABORT_MESSAGE: string = 'Task aborted';

    export const getSanitizedMessage = (message: any, error: boolean): string => {

        if (typeof message === 'undefined'
            || message === null
            || (Array.isArray(message) && message.length === 0)) {
            message = error
                ? DEFAULT_FATAL_ERROR_MESSAGE
                : DEFAULT_SUCCESS_MESSAGE;
        }

        if (message.hasOwnProperty('message')) {
            message = message['message'];
        } else if (Util.isFunction(message["getMessage"])) {
            message = message["getMessage"].bind(message)();
        }

        if (Array.isArray(message)) {
            if(message.length > 1) {
                message = getMessageFromCollection(message);
            } else {
                message = message[0];
            }
        }

        if (typeof message !== 'string') {
            message = inspect(message);
        }

        return message;
    };

    export const getMessageFromCollection: (args: any[]) => string = (args: any[]): string => {

        if (args.length === 1) {
            return inspect(args[0]);
        }

        const listElementsHTML: string = args.reduce(
            (left: string, right: any) => {
                if (typeof right !== 'string') {
                    if (Array.isArray(right)) {
                        right = getMessageFromCollection(right);
                    } else {
                        right = inspect(right);
                    }
                }
                return left + `<li>${right}</li>`;
            },
            ''
        );

        return `<ul>${listElementsHTML}</ul>`;
    };

    export const out = (id: string, message: any, error: boolean = false) => {

        let update: CommandUpdate = new CommandUpdate(id);

        update.out(message, error);

        return update;
    };

    export const completed = (id: string, error: boolean = false, message: any = null, response:boolean = false) => {
        message = getSanitizedMessage(message, error);

        let update: CommandUpdate = new CommandUpdate(id);

        update.completed = true;
        update.error = error;

        if(response) {
            update.response = message;
        } else {
            update.out(message, error);
        }

        update.progress = 100;

        return update;
    };

    export const error = (id: string, message: any = null, response:boolean = false): CommandUpdate => {
        return completed(id, true, message, response);
    };

    export const fromCommandLike = (id: string, commandLike: CommandLike): CommandUpdate => {
        let update: CommandUpdate = new CommandUpdate(id);

        Object.keys(commandLike).forEach(
            (property: string) => update[property] = commandLike[property]
        );

        return update;
    };

}