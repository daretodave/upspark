import {Log} from "./log";
import {LogMessage} from "./log-message";
import {LogTranslator} from "./log-translator";

interface ILogger {
    error(...args:any[]): ILogger;
    info(...args:any[]): ILogger;
    append(error:boolean, ...args:any[]): ILogger;
}
export class Logger  {

    private static log:Log;
    private static max:number;
    private static save: () => void = null;

    public static attach(log:Log, max:number, save: () => void): ILogger {
        this.log = log;
        this.max = max;
        this.save = save;

        let self:any = this;
        return self;
    }

    private static push(error:boolean, ...args:any[]) {
        let message:LogMessage = new LogMessage(args.join('\n'), error);

        console[error ? 'error' : 'log'](LogTranslator.getMessageText(message, true));

        if(this.log === null) {
            return this;
        }

        this.log.messages.unshift(message);
        if(this.log.messages.length > this.max) {
            this.log.messages.splice(this.max);
        }
    }

    public static append(error:boolean, ...args:any[]): ILogger {
        args.forEach((arg) =>  Logger.push(error, arg));
        if(this.save !== null) {
            this.save();
        }

        let self:any = this;
        return self;
    }

    public static info(...args:any[]): Logger {
        return this.append(false, args);
    }

    public static error(...args:any[]): ILogger {
        return this.append(false, args);
    }

}