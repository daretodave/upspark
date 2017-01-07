import {Injectable} from "@angular/core";
import {SystemService} from "../../shared/system/system.service";
import {CommandUpdate} from "../../../../app/model/command/command-update/command-update";
import * as _ from "lodash";
import {CommandListNavigation} from "./command-list-navigation";
import {CommandIntent} from "../../../../app/model/command/command-intent";
import {CommandWrapper} from "./command-wrapper";
import {CommandLogEntry} from "../../../../app/model/command/command-log-entry";

const generatedUUID = require('uuid/v1');

@Injectable()
export class CommandService {

    private commands: CommandWrapper[] = [];
    private cursor: number = 0;

    constructor(private system: SystemService) {
    }

    execute(intent: CommandIntent):CommandWrapper {
        console.log(intent);
        const command: CommandWrapper = new CommandWrapper(generatedUUID(), intent);

        this.commands.push(command);
        if (this.cursor+1 === this.commands.length) {
            this.cursor++;
        }

        this.system.send('command-run', command.reference);

        return command;
    }

    getCommands(): CommandWrapper[] {
        return this.commands;
    }

    getSortedCommands(): CommandWrapper[] {
        return _.sortBy(this.commands, (command: CommandWrapper) => command.reference.update);
    }

    onStateChange(update: CommandUpdate) {
        let command: CommandWrapper = this.commands.find(
            (command: CommandWrapper) => command.reference.id === update.id
        );
        if (!command) {
            return;
        }

        Object.keys(update).forEach((property: string) => {
            if (update[property] === null
                || !command.reference.hasOwnProperty(property)
                || property === 'errors'
                || property === 'messages') {
                return;
            }

            command.reference[property] = update[property];
        });

        update.messages.forEach(
            (message: string) => command.reference.log.push(new CommandLogEntry(message))
        );

        update.errors.forEach(
            (message: string) => command.reference.log.push(new CommandLogEntry(message, CommandLogEntry.ERROR))
        );

        command.reference.update = Date.now();
    }

    goToCursor(target: number): CommandListNavigation {
        let commands: CommandWrapper[] = this.getSortedCommands();
        let result: CommandListNavigation = new CommandListNavigation(this.cursor);

        result.fromPristine = this.cursor === this.commands.length;

        this.cursor = target;

        let command: CommandWrapper = commands[this.cursor];

        result.fromHidden = command.stale;
        result.navigate = true;
        result.command = command;

        command.active = true;
        command.stale = false;
        command.update = -1;

        return result;
    }

    navigate(up: boolean): CommandListNavigation {
        let result: CommandListNavigation = new CommandListNavigation(this.cursor);

        if (this.commands.length < 1) {
            return result;
        }
        result.fromPristine = this.cursor === this.commands.length;

        let target: number = this.cursor + (up ? -1 : 1);

        if (target < 0) {
            target = this.commands.length - 1;
        } else if (target > this.commands.length) {
            target = 0;
        }

        let commands: CommandWrapper[] = this.getSortedCommands();
        let command: CommandWrapper = this.cursor < this.commands.length ? commands[this.cursor] : null;

        if (command !== null) {
            command.active = false;
        }

        this.cursor = target;

        command = this.cursor < this.commands.length ? commands[this.cursor] : null;

        if (command !== null) {
            result.command = command;
            result.fromHidden = command.stale;
            result.navigate = true;

            command.active = true;
            command.stale = false;
            command.update = -1;
        } else if (this.cursor === this.commands.length) {
            result.reset = true;
        }

        return result;
    }

    isNavigating(): boolean {
        return this.cursor !== this.commands.length;
    }

    resetNavigation() {
        let commands: CommandWrapper[] = this.getSortedCommands();

        if (this.cursor < this.commands.length) {
            let command: CommandWrapper = commands[this.cursor];
            command.active = false;
        }

        this.cursor = this.commands.length;
    }

    getCursor(): number {
        return this.cursor;
    }
}