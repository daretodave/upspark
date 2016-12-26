import {Platform} from "./platform";
import {CommandUpdateListener} from "../../model/command/command-update/command-update-listener";
import {
    CommandUpdateCommunicator,
    CommandUpdateCommunicatorOptions
} from "../../model/command/command-update/command-update-emitter";
import {CommandIntent} from "../../model/command/command-intent";
export class PlatformExecutorTask extends CommandUpdateCommunicator {

    constructor(public platform: Platform,
                options:CommandUpdateCommunicatorOptions) {
        super(options);
    }

}