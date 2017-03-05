import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;
import {Stats} from "fs";
import {Util} from "../../../util/util";

const shell = require('electron').shell;

export class Open extends InternalCommand {

    onExecute(...parts: string[]): any {

        parts = [].concat(parts);

        let resolve:string = path.join.apply(null, parts);

        Logger.info(`opening '${resolve}' from ${parts.join(',')} | cwd = ${this.task.host.cwd()}`);

        if (!path.isAbsolute(resolve)) {
            resolve = path.join(this.task.host.cwd(), resolve);
        }

        fs.stat(resolve, (err: ErrnoException, stats: Stats) => {
            if (err) {
                this.reject(err);
                return;
            }

            Util.openFile(resolve);

            this.resolve(`Opened ${resolve}`);
        });

    }

}