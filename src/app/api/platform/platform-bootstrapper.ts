import {Resource} from "../../system/resource/resource";
import {PlatformPackage, DEFAULT_MAIN} from "./platform-package";
import {Logger} from "../../system/logger/logger";
import * as path from 'path';
import * as fs from 'fs';

import {Platform} from "./platform";

const template:string = require('./platform-template.txt');

export class PlatformBootstrapper {

    constructor(private resources:Resource, private platform:Platform) {
    }

    public attach() {
        this.resources.attach('package.json', PlatformPackage);
    }

    private error(...args:any[]): string {
        return `Upspark had an issue starting up the platform.\n${args.join('\n')}`;
    }

    private exists(path:string, original:boolean): Promise<boolean> {
        Logger.info(`confirming platform script is at ${path}`);
        let executor = (resolve: (value?: boolean | PromiseLike<boolean>) => void, reject: (reason?: any) => void) => {
            fs.exists(path, (exists: boolean) => {
                if(exists) {
                    Logger.info(`platform script exists`);
                    resolve(true);
                    return;
                }
                if(!exists && !original) {
                    reject(false);
                    return;
                }

                Logger.info(`no platform script at path, building one`);

                fs.writeFile(path, template, (err: NodeJS.ErrnoException) => {
                    if(err !== null) {
                        reject(err);
                        return;
                    }

                    Logger.info(`template platform script written to ${path}`);
                    resolve(true);
                });
            });
        };
        return new Promise<boolean>(executor);
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

                return Promise.all([
                    this.exists(main, original),
                    main
                ]);

            })
            .then((values:any[]) => {
                let path: string = values[1];
                if(!values[0]) {
                    reject(this.error(
                        `The entry point '${path}' could not be found.`,
                        `Please double check your package.json file.'.`
                    ));
                    return;
                }

                Logger.info('webpacking platform');
            })
            .then(() => {
                resolve(true);
            })
            .catch((e) => {
                //Logger.finish('platform');
                reject(e ? (e.stack || e) : this.error());
            });
        };

        return new Promise<any>(executor);
    }

}