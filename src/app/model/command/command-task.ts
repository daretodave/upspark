import {Command} from "./command";
import {CommandUpdateListener} from "./command-update/command-update-listener";
export class CommandTask {

    constructor(private sender:any, command:Command, update:CommandUpdateListener) {
    }

}