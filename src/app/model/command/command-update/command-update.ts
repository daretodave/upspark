import {Command} from "../command";
import {inspect} from "util";
import {CommandLike} from "../command-like";
import {Util} from "../../../util/util";
import {CommandLogEntry} from "../command-log-entry";

export class CommandUpdate extends Command {

    message: any;

    constructor(id: string,
                public messages: string[] = [],
                public errors: string[] = []) {
        super(id, null);

        this.absorb();

        this.update = Date.now();
    }

    out(message: any, error: boolean = false, isText: boolean = false) {
        if (this.output == null) {
            this.output = [];
        }

        this.output.push(new CommandLogEntry(
            CommandUpdate.getSanitizedMessage(
                message,
                error,
                isText
            ), error ? CommandLogEntry.ERROR : CommandLogEntry.INFO)
        );
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
        'You can check the log in the upspark directory for details.',
        'Running :log will open up the log also'
    ], ["<br><br>"]);
    export const DEFAULT_ERROR_MESSAGE: string = 'Something went wrong';
    export const DEFAULT_SUCCESS_MESSAGE: string = '';
    export const DEFAULT_ABORT_MESSAGE: string = 'Task aborted';

    const NBSP = '&nbsp;';
    const TAB_REPLACEMENT = NBSP.repeat(8);

    export const highlight = (text: string) => {

        text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return text.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        }).replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/\t/g, TAB_REPLACEMENT).replace(/    /g, NBSP);;
    };

    export const syntaxHighlight = (message: any): string => {
        let result: string = CommandUpdate.highlight(JSON.stringify(message, undefined, 4));

        if (message !== null && typeof message !== 'undefined' && message.constructor && message.constructor.name) {
            result = `${message.constructor.name + (Array.isArray(message) ? ` [${message.length}]` : '')}<br>\n${result}`;
        }
        return result;
    };

    export const getSanitizedMessage = (message: any, error: boolean, isText: boolean = false): string => {

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

        console.log('OOOH', message.toString().slice(0, 200), '....', isText, typeof message);

        if (Array.isArray(message)) {
            message = getMessageFromCollection(message, error);
        }
        if (typeof message !== 'string') {
            message = inspect(message);
        }

        if (isText) {
            message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');
            message = message.replace(/\t/g, TAB_REPLACEMENT);
            message = message.replace(/ /g, NBSP);
        }

        return message;
    };

    export const getMessageFromCollection = (args: any[], error: boolean): string => {

        if (args.length === 1) {
            return getSanitizedMessage(args[0], error);
        }

        return `<ul>${args.reduce(
            (left: string, right: any) => left + `<li>${getSanitizedMessage(right, error)}</li>`, ''
        )}</ul>`;
    };

    export const out = (id: string, message: any, error: boolean = false, isText: boolean = false) => {

        let update: CommandUpdate = new CommandUpdate(id);

        update.out(
            message,
            error,
            isText
        );

        return update;
    };

    export const completed = (id: string, error: boolean = false, message: any = null, response: boolean = false) => {
        message = getSanitizedMessage(message, error);

        let update: CommandUpdate = new CommandUpdate(id);

        update.completed = true;
        update.error = error;
        update.message = message;

        if (response) {
            update.response = message;
        } else {
            update.out(message, error);
        }

        update.progress = 100;

        return update;
    };

    export const error = (id: string, message: any = null, response: boolean = false): CommandUpdate => {
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