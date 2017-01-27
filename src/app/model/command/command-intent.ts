import {CommandArgument} from "./command-argument";
import {CommandIntentDigest} from "./command-intent-digest";
export class CommandIntent {

    constructor(intent: CommandIntent = null) {
        if (intent !== null) {
            this.command = intent.command;
            intent.arguments.forEach((argument: CommandArgument) => this.arguments.push(new CommandArgument(argument)));

            let digest: CommandIntentDigest = CommandIntentDigest.from(this);

            this.display = digest.command.normalized;
        }
    }

    display: string = '';
    command: string = '';
    arguments: CommandArgument[] = [];

}