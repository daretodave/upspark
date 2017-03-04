import {CommandRuntime} from "./command-runtime";
import {UpText} from "../up-text";
import {CommandIntent} from "./command-intent";
export class CommandIntentDigest {

    constructor(public runtime: CommandRuntime = CommandRuntime.PLATFORM,
                public command: UpText = new UpText(),
                public argument: string[] = []) {
    }

    public isEmpty(): boolean {
        return !!this.command.content.length;
    }
}
export namespace CommandIntentDigest {

    export const from = (intent: CommandIntent): CommandIntentDigest => {
        const digest = new CommandIntentDigest();

        let blocks = intent.command.split(/\s+/g);
        let input: string;

        if (blocks.length) {
            input = blocks[0].trim();

            //:reload commands
            if (blocks.length > 1) {
                for(let index = 1; index < blocks.length; index++) {
                    digest.argument.push(blocks[index]);
                }
            }
        } else {
            input = '';
        }

        for (let index = 0; index < intent.arguments.length; index++) {
            digest.argument.push(intent.arguments[index].content);
        }

        if (input.length) {
            let runtimeFlag: string = input.charAt(0);
            let runtime: CommandRuntime = CommandRuntime.from(runtimeFlag);
            //": reload"\\
            if (runtime !== null) {
                digest.runtime = runtime;
                //"reload"\\
                input = input.substring(1).trim();
            }

            digest.command.content = input;
        }

        return digest;
    }

}