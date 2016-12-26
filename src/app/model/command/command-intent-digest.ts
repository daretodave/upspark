import {CommandRuntime} from "./command-runtime";
import {UpText} from "../up-text";
import {CommandIntent} from "./command-intent";
export class CommandIntentDigest {

    public runtime: CommandRuntime;
    public command: UpText;

}
export namespace CommandIntentDigest {

    export const from = (intent: CommandIntent):CommandIntentDigest => {
        const digest = new CommandIntentDigest();

        digest.runtime = CommandRuntime.USER;

        return digest;
    }

}