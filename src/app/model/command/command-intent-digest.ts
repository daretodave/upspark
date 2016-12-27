import {CommandRuntime} from "./command-runtime";
import {UpText} from "../up-text";
import {CommandIntent} from "./command-intent";
export class CommandIntentDigest {

    constructor(public runtime: CommandRuntime = CommandRuntime.PLATFORM,
                public command: UpText = new UpText()) {
    }

    public isEmpty():boolean {
        return !!this.command.content.length;
    }
}
export namespace CommandIntentDigest {

    export const from = (intent: CommandIntent): CommandIntentDigest => {
        const digest = new CommandIntentDigest();

        let input = intent.command.trim();

        if (input.length) {
            let runtimeFlag: string = input.charAt(0);
            let runtime: CommandRuntime = CommandRuntime.from(runtimeFlag);
            //": reload"\\
            if (runtime !== null) {
                digest.runtime = runtime;
                //"reload"\\
                input = input.substring(0).trim();
            }

            digest.command.content = input;
        }

        return digest;
    }

}