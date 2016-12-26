import {CommandIntent} from "./command-intent";
import {CommandLogEntry} from "./command-log-entry";
import {CommandLike} from "./command-like";
import {CommandUpdateCommunicator} from "./command-update/command-update-emitter";
import {CommandUpdateMessage} from "./command-update/command-update-message";
export class Command implements CommandLike {

    constructor(public id: string,
                public intent: CommandIntent,
                public tag: string = '',
                public response: string = '',
                public output: string = '',
                public error: boolean = false,
                public canceled: boolean = false,
                public completed: boolean = false,
                public update: number = Date.now(),
                public init: number = Date.now(),
                public progress: number = -1,
                public log: CommandLogEntry[] = []) {
    }

}
export namespace Command {

    const separateWordsPattern: RegExp = /(?:^\w|[A-Z]|\b\w|\s+)/g;
    const underscoreOrDashPattern: RegExp = new RegExp('\_|\-', 'g');
    const camelcaseJoiner = (match: string, index: number): string => {
        if (match.trim().length === 0) {
            return "";
        }
        return index == 0 ? match.toLowerCase() : match.toUpperCase();
    };

    export const getNormalizedName = (name: string): string => {
        if (name === null
            || typeof name !== 'string'
            || name.length === 0) {
            return '';
        }

        return name
            .trim()
            .replace(underscoreOrDashPattern, ' ')
            .replace(separateWordsPattern, camelcaseJoiner);
    };

    export const communicator = (command: Command, handler: (message: CommandUpdateMessage) => any): CommandUpdateCommunicator => {
        return new CommandUpdateCommunicator(command.id, command.intent, handler);
    }

}