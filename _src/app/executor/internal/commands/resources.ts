import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;
import {Stats} from "fs";

const shell = require('electron').shell;

export class Resources extends InternalCommand {

    onExecute(...parts: string[]): any {

        Logger.info(`Launching resources in explorer`);

        shell.openExternal(this.task.host.resources().root, (err:any) => {
            Logger.error(err);
        });

        return 'Resource folder opened';
    }

}