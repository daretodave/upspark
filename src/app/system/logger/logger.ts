import {Log} from "./log";
import {LogMessage} from "./log-message";
import {LogTranslator} from "./log-translator";
import {LoggerBlock} from "./logger-block";

interface ILogger {
    error(...args:any[]): ILogger;
    info(...args:any[]): ILogger;
    append(error:boolean, ...args:any[]): ILogger;
    start(name:string): ILogger;
    finish(name:string): ILogger;
}
export class Logger  {

    private static log:Log = null;
    private static max:number;
    private static saving:Promise<any>;
    private static dirty:boolean;
    private static pendingError:boolean;
    private static save: () => Promise<any> = null;
    private static blocks: LoggerBlock[];

    public static attach(log:Log, max:number, save: () => Promise<any>): ILogger {
        this.log = log;
        this.max = max;
        this.save = save;
        this.blocks = [];

        let self:any = this;
        return self;
    }

    public static persist(error:boolean = false, override:boolean = false): Promise<any> {
        if(this.save === null || (this.blocks.length > 0 && !error)) {
            return;
        }

        if(this.saving != null && !override) {
            this.dirty = true;
            this.pendingError = error;
            return this.saving;
        }

        let promise:Promise<any> =
            this.save()
                .then(() => {
                    if(this.dirty) {
                        this.dirty = false;
                        return this.persist(this.pendingError, true);
                    }

                    this.saving = null;
                    return true;
                })
                .catch((e) => {
                    console.log(e);
                    this.saving = null;
                });

        if(!override) {
            this.saving = promise;
        }

        return promise;
    }

    private static getTimeText(diff:number, short:boolean = false):string {

        let unit = short? 'ms' : 'milliseconds';
        if(diff > 1000) {
            diff = Math.round(diff / 1000);
            unit = short? 's' : 'seconds';
        }
        if(diff > 60000) {
            diff = Math.round(diff / 60);
            unit = short? 'm' : 'minutes';
        }

        return `${diff}${short?'':' '}${unit}`;
    }

    private static push(error:boolean, ...args:any[]): ILogger {
        let text:string = args.join('\n');
        let indent:number = 0;

        if(this.blocks) {

            let lastBlock:LoggerBlock = null;
            this.blocks.forEach((block:LoggerBlock) => {
                if(block.sync) {
                    indent++;
                    lastBlock = block;
                }
            });

            let prefix:string = '\t'.repeat(indent);
            if(lastBlock != null) {
                prefix = `${prefix}~ `;
                indent += 2;
            }

            text = prefix + text;
        }
        let message:LogMessage = new LogMessage(text, error);
        message.indent = indent;
        text = LogTranslator.getMessageText(message, true);

        console[error ? 'error' : 'log'](text);

        if(this.log === null) {
            return this;
        }

        if(error) {
            this.log.error = message;
        }

        this.log.messages.unshift(message);
        if(this.log.messages.length > this.max) {
            this.log.messages.splice(this.max);
        }

        let self:any = this;
        return self;
    }

    public static finish(name:string, error:string = null): ILogger {
        if(error != null) {
            this.error(error);
        }

        let task:LoggerBlock = null;
        this.blocks = this.blocks.filter((block:LoggerBlock) => {
            if(block.name === name) {
                task = block;
                return false;
            }
            return true;
        });
        let self:any = this;

        if(task === null) {
            return self;
        }
        let diff:number = (new Date().getTime()) - task.init;

        this.push(false, `#${name} finished in ${this.getTimeText(diff)}`);
        this.persist();

        return self;
    }

    public static start(name:string, sync: boolean = true): ILogger {
        let self:ILogger = this.push(false, `#${name} started`);
        this.blocks.push(new LoggerBlock(name, sync));
        return self;
    }

    public static append(error:boolean, ...args:any[]): ILogger {
        args.forEach((arg) =>  Logger.push(error, arg));
        this.persist();

        let self:any = this;
        return self;
    }

    public static info(...args:any[]): ILogger {
        let self:ILogger = this.push(false, args.join('\n'));
        this.persist();

        return self;
    }

    public static error(...args:any[]): ILogger {
        let self:ILogger = this.push(true, args.join('\n'));

        this.persist(true);
        return self;
    }

}