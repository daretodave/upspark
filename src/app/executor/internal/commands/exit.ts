import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;

const {app} = require('electron');

export class Exit extends InternalCommand {

    onExecute(): any {

        Logger.info('Exiting from :exit command');

        app.quit();

        return 'Exiting Upspark';

    }

}