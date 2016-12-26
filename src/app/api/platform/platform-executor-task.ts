import {Platform} from "./platform";
import {CommandUpdateHandler} from "../../model/command/command-update-handler";
import {
    CommandUpdateCommunicator,
    CommandUpdateCommunicatorOptions
} from "../../model/command/command-update-communicator";
import {CommandIntent} from "../../model/command/command-intent";
export class PlatformExecutorTask extends CommandUpdateCommunicator {

    constructor(public platform: Platform,
                options:CommandUpdateCommunicatorOptions) {
        super(options);
    }

}