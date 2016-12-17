import {Injectable} from "@angular/core";
import {Command} from "./command";
import {SystemService} from "../../shared/system/system.service";
import {CommandStateChange} from "../../../../app/api/platform/command-state-change";
import * as _ from 'lodash';
import {CommandListComponent} from "./command-list.component";
import {CommandListNavigation} from "./command-list-navigation";

const {raw} = require('guid');

@Injectable()
export class CommandService {

    private commands:Command[] = [];
    private cursor:number = 0;

    constructor(private system:SystemService) {
    }

    execute(title:string, args:string, originalInput:string) {
        const command:Command = new Command(raw(), originalInput, title, args);

        this.commands.push(command);
        if (this.cursor+1 === this.commands.length) {
            this.cursor++;
        }

        this.system.send('command-run', command);
    }

    getCommands(): Command[] {
        return this.commands;
    }

    onStateChange(update:CommandStateChange) {

        console.log(update);

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

    goToCursor(target:number):CommandListNavigation {
        let commands:Command[] = _.sortBy(this.commands, 'update');
        let result:CommandListNavigation = new CommandListNavigation(this.cursor);

        result.fromPristine = this.cursor === this.commands.length;

        this.cursor = target;

        let command:Command =  commands[this.cursor];

        result.fromHidden = command.stale;
        result.navigate = true;
        result.command = command;

        command.isNavigatedTo = true;
        command.stale = false;
        command.lastInteraction = -1;

        return result;
    }

    navigate(up: boolean):CommandListNavigation {
        let result:CommandListNavigation = new CommandListNavigation(this.cursor);

        if(this.commands.length < 1) {
            return result;
        }
        result.fromPristine = this.cursor === this.commands.length;

        let target:number = this.cursor + (up ? -1 : 1);

        if (target < 0) {
            target = this.commands.length-1;
        } else if(target > this.commands.length) {
            target = 0;
        }

        let commands:Command[] = _.sortBy(this.commands, 'update');
        if (this.cursor < this.commands.length) {
            let command:Command =  commands[this.cursor];
            command.isNavigatedTo = false;
        }

        this.cursor = target;

        if(this.cursor < this.commands.length) {
            let command:Command =  commands[this.cursor];

            result.fromHidden = command.stale;
            result.navigate = true;
            result.command = command;

            command.isNavigatedTo = true;
            command.stale = false;
            command.lastInteraction = -1;

        } else if(this.cursor === this.commands.length) {
            result.reset = true;
        }

        return result;
    }

    isNavigating():boolean {
        return this.cursor !== this.commands.length;
    }

    resetNavigation() {
        let commands:Command[] = _.sortBy(this.commands, 'update');

        if(this.cursor < this.commands.length) {
            let command:Command =  commands[this.cursor];
            command.isNavigatedTo = false;
        }

        this.cursor = this.commands.length;
    }

    getCursor():number {
        return this.cursor;
    }
}