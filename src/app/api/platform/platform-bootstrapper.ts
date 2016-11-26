import {Resource} from "../../system/resource/resource";
import {PlatformPackage, DEFAULT_MAIN} from "./platform-package";
import {Logger} from "../../system/logger/logger";

import * as path from 'path';
import * as fs from 'fs';

const template:string = require('raw-loader!./platform-template.js');

export class PlatformBootstrapper {

    constructor(private resources:Resource) {
    }

    attach() {
        this.resources.attach('package.json', PlatformPackage);
    }

    private error(...args:any[]): string {
        return `Upspark had an issue starting up the platform.\n${args.join('\n')}`;
    }

    private load(path:string, original:boolean): Promise<string> {
        Logger.info(`reading platform script at ${path}`);
        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
            fs.readFile(path, 'utf8', (err: NodeJS.ErrnoException, data: string) => {
                if(err === null) {
                    Logger.info(`finished reading platform script | ${data.length} bytes`);
                    resolve(data);
                    return;
                }

                if(err.code !== 'ENOENT' || !original) {
                    reject(err);
                    return;
                }

                Logger.info(`no platform script at path, building one`);

                fs.writeFile(path, template, (err: NodeJS.ErrnoException) => {
                    if(err !== null) {
                        reject(err);
                        return;
                    }

                    Logger.info(`template platform script written to ${path}`);
                    resolve(template);
                });
            });
        };
        return new Promise<string>(executor);
    }

    reload(): Promise<any>  {
        let executor = (resolve: (value:any) => void, reject: (reason?: any) => void) => {
            //Logger.start('platform');

            this.resources
            .load('package')
            .then((_package:PlatformPackage) => {
                let main: string = _package.main || DEFAULT_MAIN;
                if(!path.isAbsolute(main)) {
                    main = path.join(this.resources.root, main);
                }

                let ext: string = path.extname(main).toUpperCase();
                if (ext !== '.JS') {
                    reject(this.error(
                        `The entry point for the platform must be a JavaScript file with the extension '.js'.`,
                        `The provided entry point in the package.json file was '${_package.main}'.`
                    ));
                    return;
                }

                let defaulted:string = path.join(this.resources.root, DEFAULT_MAIN);
                let original:boolean = false;

                if (defaulted.toUpperCase() === main.toUpperCase()) {
                    original = true;
                }

                Logger.info(`platform.main = ${main}`);
                Logger.info(`platform.original = ${original} | ` +
                            `platform.name = ${_package.name} | ` +
                            `platform.version = ${_package.version}`);

                return this.load(main, original);

            })
            .then((main:string) => {
                console.log(main);
            })
            .then(() => {
                resolve(true);
            })
            .catch((e) => {
                //Logger.finish('platform');
                reject(e);
            });
        };

        return new Promise<any>(executor);
    }

}