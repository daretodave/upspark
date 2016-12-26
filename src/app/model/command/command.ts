import {CommandIntent} from "./command-intent";
import {CommandLogEntry} from "./command-log-entry";
import {Commandable} from "./commandable";
export class Command implements Commandable {

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
    }

}