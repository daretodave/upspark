import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;

const {app} = require('electron');

export class End extends InternalCommand {

    onExecute(): any {

        Logger.info('Ending all tasks');

        this.task.host.endAllTasks();

        return 'Ending all onging tasks';

    }

}