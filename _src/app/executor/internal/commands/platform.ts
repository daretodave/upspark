import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from "path";
import ErrnoException = NodeJS.ErrnoException;
import {Util} from "../../../util/util";

const shell = require('electron').shell;

export class Platform extends InternalCommand {

    onExecute(...parts: string[]): any {

        Logger.info(`Launching platform script in default editor`);

        Util.openFile(this.task.host.platform().script);

        return 'Platform script opened in default editor';
    }

}