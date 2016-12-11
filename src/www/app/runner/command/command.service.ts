import {Injectable} from "@angular/core";
import {Command} from "./command";
import {SystemService} from "../../shared/system/system.service";
import {CommandStateChange} from "../../../../app/api/platform/command-state-change";

const {raw} = require('guid');

@Injectable()
export class CommandService {

    private commands:Command[] = [];

    constructor(private system:SystemService) {
    }

    execute(title:string, args:string) {
        const command:Command = new Command(raw(), title.trim(), args);
        this.commands.push(command);

        this.system.send('command-run', command);
    }

    getCommands(): Command[] {
        return this.commands;
    }

    onStateChange(update:CommandStateChange) {

        let command:Command = this.commands.find((entry:Command) => entry.id === update.id);
        if (!command) {
            return;
        }

        for(let change in update.changes) {
            if(!update.changes.hasOwnProperty(change)) {
                continue;
            }

            if(change === 'log' && update.appendToLog.length) {
                command.log.push.apply(command.log, update.appendToLog);
            }

            command[change] = update.changes[change];
        }

    }
}