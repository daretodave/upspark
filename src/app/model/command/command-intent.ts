import {CommandArgument} from "./command-argument";
import {CommandIntentDigest} from "./command-intent-digest";
import {CommandRuntime} from "./command-runtime";
export class CommandIntent {

    constructor(intent?: CommandIntent | CommandIntentDigest) {

        let digest:CommandIntentDigest = null;

        if (intent instanceof CommandIntent) {
            this.command = intent.command;
            intent.arguments.forEach(argument => this.arguments.push(new CommandArgument(argument)));
            digest = CommandIntentDigest.from(this);
        } else if(intent instanceof CommandIntentDigest) {
            this.command = intent.command.content;
            intent.argument.forEach(arg => this.arguments.push(new CommandArgument(arg)));
            digest = intent;
        }

        if(digest !== null) {
            this.display = `<span class="command-runtime">${CommandRuntime.flagFor(digest.runtime)}</span>&nbsp;` + digest.command.normalized;
        }

    }

    display: string = '';
    command: string = '';
    arguments: CommandArgument[] = [];

}