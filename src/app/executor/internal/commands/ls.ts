import {InternalCommand} from "../internal-command";
import * as path from 'path';
import * as fs from 'fs';
import ErrnoException = NodeJS.ErrnoException;
import {Logger} from "../../../model/logger/logger";
import {Stats} from "fs";

export class Ls extends InternalCommand {

    seek(file: string, recursive: boolean): Promise<string[]> {
        let executor = (resolve: (value?: string[] | PromiseLike<string[]>) => void, reject: (reason?: any) => void) => {


            if (!recursive) {
                resolve([file]);
                return;
            }

            fs.stat(file, (err: ErrnoException, stat: Stats) => {

                if (err) {
                    return;
                }

                if (!stat.isDirectory()) {
                    resolve([file]);
                    return;
                }

                this.scan(file, recursive).then((files: string[]) => resolve([file, ...files])).catch(reject);
            });
        };

        return new Promise<string[]>(executor);
    }

    scan(dir: string, recursive: boolean): Promise<string[]> {

        let executor = (resolve: (value?: string[] | PromiseLike<string[]>) => void, reject: (reason?: any) => void) => {

            fs.readdir(dir, (err: ErrnoException, items: string[]) => {

                if (err) {
                    return;
                }

                let task: Promise<any>[] = items.map(item => this.seek(path.join(dir, item), recursive));

                Promise.all(task).then((...files: string[][]) => resolve(files.reduce((bucket: string[], group: string[]) => {
                    return bucket.concat(group);
                }, []))).catch(reject);
            });


        };

        return new Promise<string[]>(executor);
    }

    onExecute(...args: string[]) {
        let dir: string[] = [];
        let recursive: boolean = false;

        Logger.info(`ls | args ${args.join(',')} | cwd ${this.task.host.cwd()}`);

        for (let i = 0; i < args.length; i++) {
            let arg: string = args[i].trim();
            if (arg.charAt(0) === '-') {
                if (arg === '-R') {
                    recursive = true;
                }
            } else {
                dir.push(arg);
            }
        }

        let resolve: string;
        if (dir.length) {
            resolve = path.join.apply(null, dir);

            if (!path.isAbsolute(resolve)) {
                resolve = path.join(this.task.host.cwd(), resolve);
            }

            try {
                let stat: Stats = fs.statSync(resolve);
                if (!stat.isDirectory()) {
                    this.reject(`${path.normalize(resolve)} is not a directory`);
                    return;
                }
            } catch (err) {
                this.reject(err);
            }

            Logger.info(`ls | path provided as ${resolve}`);

        } else {
            resolve = this.task.host.cwd();
        }

        Logger.info(`ls | listing from ${resolve} | recursive ? ${recursive}`);

        this.scan(resolve, recursive).then((files: string[]) => {
            let message: string = `Found ${files.length} files in ${resolve} ${files.length ? '> <br>' : ''}`;

            files = files.map(fileName => fileName.toString().replace(resolve, ''));

            if (files.length && files.length > 20) {
                files.sort();

                let records: string[][] = [
                    [],
                    []
                ];

                for (let i = 0, column = 0; i < files.length; i++) {
                    records[column++].push(files[i]);

                    if (column === 2) {
                        column = 0;
                    }
                }

                message += `<div class='row'>
                    <div class='col-md-6 scroll-x' ><div>${records[0].join("</div><div>")}</div></div>
                    <div class='col-md-6 scroll-x'><div>${records[1].join("</div><div>")}</div></div>
                    </div>`;
            } else {
                message += files.join('<br>');
            }

            this.resolve(message);
        }).catch(this.reject);
    }

}