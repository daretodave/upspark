import {Resource} from "../../system/resource/resource";
import {PlatformPackage, DEFAULT_MAIN} from "./platform-package";
import {Logger} from "../../system/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
const {NodeVM} = require('vm2');

import {Platform} from "./platform";

const babel = require("babel-core"),
      presetLatest = require("babel-preset-latest");

const template:string = require('./platform-template.txt');

export class PlatformBootstrapper {

    private code:string;
    private vm:any;

    private compiler(options:any) {
        return function(code:string) {
            return babel.transform(code, options).code;
        }
    }

    constructor(private resources:Resource, private platform:Platform) {
        let options:any = {};
        options.presets = [];
        options.presets.push(presetLatest);

        this.vm = new NodeVM({
            console: 'inherit',
            compiler: this.compiler(options),
            sandbox: {},
            require: {
                external: true,
                builtin: ['*'],
                root: resources.root
            }
        });
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
        this.code = null;
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
                    this.load(main, original)
                ]);

            })
            .then((values:any[]) => {
                this.code = values[0];

                Logger.info('testing');

                let test:any = this.vm.run(this.code);
                console.log(test);
            })
            .then(() => {
                resolve(true);
            })
            .catch((e) => {
                //Logger.finish('platform');
                if(this.code != null) {
                    Logger.info(this.code);
                }
                reject(e ? (e.stack || e) : this.error());
            });
        };

        return new Promise<any>(executor);
    }

}