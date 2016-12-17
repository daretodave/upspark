import {InternalCommand} from "../internal-command";
export class Reload extends InternalCommand {

    onExecute(...args: string[]) {
        this.resolve('good stuff');
    }

}