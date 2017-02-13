import {InternalCommand} from "../internal-command";
import {inspect} from "util";
import ErrnoException = NodeJS.ErrnoException;
import {Logger} from "../../../model/logger/logger";

export class Dev extends InternalCommand {

    onExecute() {
        this.task.host.openDEVToolsForRunner();
        return 'Developer tools for the runner have been launched';
    }


}