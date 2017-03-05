import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from "path";
import ErrnoException = NodeJS.ErrnoException;
import {Util} from "../../../util/util";

const shell = require('electron').shell;

export class Config extends InternalCommand {

    onExecute(...parts: string[]): any {

        Logger.info(`Launching config in default editor`);

        Util.openFile(path.join(this.task.host.resources().root, 'settings.json'));

        return 'Configuration opened in default editor';
    }

}