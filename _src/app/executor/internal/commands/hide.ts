import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;

export class Hide extends InternalCommand {

    onExecute(): any {

        Logger.info('Hiding window from :hide command');

        this.task.host.hideRunnerWindow();

        return 'Runner window was hidden';

    }

}