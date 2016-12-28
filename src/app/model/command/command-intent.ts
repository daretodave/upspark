import {CommandArgument} from "./command-argument";
export class CommandIntent {

    constructor(intent: CommandIntent = null) {
        if (intent !== null) {
            this.command = intent.command;
            intent.arguments.forEach((argument: CommandArgument) => this.arguments.push(new CommandArgument(argument)));
        }
    }

    command: string = '';
    arguments: CommandArgument[] = [];

}