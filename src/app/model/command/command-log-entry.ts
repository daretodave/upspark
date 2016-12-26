export class CommandLogEntry {

    constructor(
        public message:string,
        public type:string = CommandLogEntry.INFO,
        public time = Date.now()
    ) {
    }

}
export namespace CommandLogEntry {
    export const ERROR:string = 'error';
    export const INFO:string = 'info';
}