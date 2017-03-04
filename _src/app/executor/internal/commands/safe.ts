import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;

export class Safe extends InternalCommand {

    onExecute(): any {

        Logger.info('Launching the safe');

        this.task.host.openSafeWindow();

        return 'Launched the Safe';

    }

}