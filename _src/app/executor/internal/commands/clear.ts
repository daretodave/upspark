import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;

const {app} = require('electron');

export class Clear extends InternalCommand {

    onExecute(): any {

        Logger.info('Clearing Runner');

        this.task.host.clearRunnerWindow();

        return '';

    }

}