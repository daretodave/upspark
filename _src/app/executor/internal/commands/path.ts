import {InternalCommand} from "../internal-command";
export class Path extends InternalCommand {

    onExecute() {
        return this.task.host.cwd();
    }

}