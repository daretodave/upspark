import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;
import {Stats} from "fs";
import {Util} from "../../../util/util";

const shell = require('electron').shell;

export class Log extends InternalCommand {

    onExecute(...parts: string[]): any {

        Logger.info(`Launching log in default editor`);

        Util.openFile(path.join(this.task.host.resources().root, 'upspark.log'));

        return 'Log opened in default editor';
    }

}