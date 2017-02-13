import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;
import {Stats} from "fs";

const shell = require('electron').shell;

export class Config extends InternalCommand {

    onExecute(...parts: string[]): any {

        Logger.info(`Launching config in default editor`);

        shell.openItem(path.join(this.task.host.resources().root, 'settings.json'));

        return 'Configuration opened in default editor';
    }

}