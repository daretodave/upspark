import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from "path";
import ErrnoException = NodeJS.ErrnoException;

const shell = require('electron').shell;

export class Config extends InternalCommand {

    onExecute(...parts: string[]): any {

        Logger.info(`Launching config in default editor`);

        shell.openExternal(path.join(this.task.host.resources().root, 'settings.json'));

        return 'Configuration opened in default editor';
    }

}