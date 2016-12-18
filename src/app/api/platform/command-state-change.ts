import {Command} from "../../../www/app/runner/command/command";
import {CommandLog} from "../../../www/app/runner/command/command-log";
export class CommandStateChange extends Command {

    public appendToLog:CommandLog[] = [];

    constructor(base:Command, changes:any = {}) {
        super(base.id, base.originalInput, base.title, base.argument);

        this.progress = base.progress;
        this.log = base.log;
        this.init = base.init;
        this.error = base.error;
        this.output = base.output;
        this.completed = base.completed;
        this.tag = base.tag;

        this.update = Date.now();

        for(let field in changes) {
            if(!changes.hasOwnProperty(field)) {
                continue;
            }

            this.modify(field, changes[field]);
        }
    }

    public changes:any = {};
    public modify(property:string, value:any) {
        let dirty:boolean = this.hasOwnProperty(property) && this[property] !== value;
        if(property === 'log-error' || property === 'log-info' || property === 'log') {
            if(Array.isArray(value)) {
                dirty = value.join() === this.log.join();
            } else {
                dirty = true;

                let entry:CommandLog = new CommandLog(value, property === 'log-error' ? CommandLog.ERROR : CommandLog.INFO);

                this.appendToLog.push(entry);
            }
            property = 'log';
        }
        if(dirty) {
            this.changes['updated'] = Date.now();
            this.changes[property] = value;
        }
    }

}