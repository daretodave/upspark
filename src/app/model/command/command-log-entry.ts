export class CommandLogEntry {

    constructor(public message: string,
                public type: string = CommandLogEntry.INFO) {
    }
}

export namespace CommandLogEntry {
    export const ERROR: string = 'error';
    export const INFO: string = 'info';
}