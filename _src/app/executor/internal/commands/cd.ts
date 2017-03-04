import {InternalCommand} from "../internal-command";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;
import {Stats} from "fs";
import {Logger} from "../../../model/logger/logger";
export class Cd extends InternalCommand {

    onExecute(...dir:string[]) {

        let resolve:string = path.join.apply(null, dir);

        Logger.info(`setting cwd to ${resolve} from ${dir.join(',')} | currently ${this.task.host.cwd()}`);

        if (!dir.length) {
            this.resolve(`Path set to ${this.task.host.toDefaultCWD()}`);
            return;
        }

        if (!path.isAbsolute(resolve)) {
            resolve = path.join(this.task.host.cwd(), resolve);
        }

        fs.stat(resolve, (err: ErrnoException, stats: Stats) => {
            if (err) {
                this.reject(err);
                return;
            }

            if(!stats.isDirectory()) {
                this.reject(`${path.normalize(resolve)} is not a directory`);
                return;
            }

            this.task.host.cwd(resolve);

            this.resolve('');
        });

    }

}