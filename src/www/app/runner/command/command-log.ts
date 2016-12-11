export class CommandLog {

    static ERROR:string = 'error';
    static INFO:string = 'info';

    constructor(public message:string, public type:string = CommandLog.INFO, public time = Date.now()) {
    }

}