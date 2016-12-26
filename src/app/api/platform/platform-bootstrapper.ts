import {Resource} from "../../system/resource/resource";
import {PlatformPackage, DEFAULT_MAIN} from "./platform-package";
import {Logger} from "../../system/logger/logger";
import * as path from 'path';
import * as fs from 'fs';
import {Platform, excludes, apiModules} from "./platform";
import methodOf = require("lodash/methodOf");
import MemoryUsage = NodeJS.MemoryUsage;
import {
    CommandUpdateCommunicatorOptions,
    CommandUpdateCommunicator
} from "../../model/command/command-update/command-update-emitter";

const babel = require('babel-core');
const MemoryFS = require("memory-fs");
const webpack = require('webpack');
const vm = require('vm');
const template:string = require('./platform-template.txt');
const platformScripts:{[key: string]: string} = {
    api:  [
        require('raw!./ext/platform-utils.js'),
        require('raw!./ext/platform-models.js'),
        require('raw!./ext/platform-internal.js')
    ].join(''),
    executor: require('raw!./ext/platform-worker.js')
};

export class PlatformBootstrapper {

    private release() {
        Logger.info(`releasing resources`);
        this.memory = null;
    }

    private memory:any = new MemoryFS();

    constructor(private resources:Resource) {
        for(const apiModule in apiModules) {
            if(!apiModules.hasOwnProperty(apiModule)) {
                continue;
            }
            this.memory.writeFileSync(`/__internal__${apiModule}.js`, apiModules[apiModule]);
        }

        const statOrig = this.memory.stat.bind(this.memory);
        const readFileOrig = this.memory.readFile.bind(this.memory);

        this.memory.stat = function (_path:any, cb:any) {
            statOrig(_path, function(err:any, result:any) {
                if (err) {
                    return fs.stat(_path, cb);
                } else {
                    return cb(err, result);
                }
            });
        };
        this.memory.readFile = function (path:any, cb:any) {
            readFileOrig(path, function (err:any, result:any) {
                if (err) {
                    return fs.readFile(path, cb);
                } else {
                    return cb(err, result);
                }
            });
        };
    }

    public attach() {
    }

    private error(...args:any[]): string {
        return `Upspark had an issue starting up the platform.\n${args.join('\n')}`;
    }

    private loadIntoMemory(file:string, memory:any, base:string): Promise<any> {
        let name:string = path.basename(file);
        let location:string = file.replace(base, '/');
        let isJSON:boolean = path.extname(file).toUpperCase() === '.JSON';

        Logger.info(`loading ${name} into memory at ${location} | isJSON = ${isJSON}`);

        let executor = (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
            fs.readFile(file, (err:any, data:Buffer) => {
                if(err && !isJSON) {
                    reject(err);
                    return;
                }

                if(isJSON) {
                    memory.writeFileSync(location, data.toString());
                    Logger.info(`file ${name} loaded`);
                    resolve(true);
                    return;
                }

                Logger.info(`transpiling ${name} | ${data.length} bytes`);
                let options:any = {};
                options.presets = [];
                options.presets.push("latest");

                let contextSwitch:string = `
                    (function(location, mappings, context) {
                        context(location, exports);
                    })('${location}', exports,  upspark['__internal'].onContextSwitch);
                `;

                try {
                    let bundle:any = babel.transform(`${contextSwitch} ${data.toString()}`, options);
                    let code:string = bundle.code;

                    Logger.info(`transpiled ${name} | ${code.length} bytes`);

                    memory.writeFileSync(location, code);

                    resolve(true);
                } catch (err) {
                    reject(err);
                }

            });
        };
        return new Promise<any>(executor);
    }

    private stat(file:string, memory:any, base:string): Promise<any> {
        Logger.info(`collecting stat on ${path.basename(file)}`);

        let executor = (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
            fs.stat(file, (err: any, stats:any) => {
                if(err) {
                    Logger.error(err);
                    resolve(true);
                    return;
                }
                let extension:string = path.extname(file).toUpperCase();

                if(stats.isDirectory()) {
                    this.collect(file, memory, base).then(resolve).catch(reject);
                } else if(extension === ".JS" || extension === ".JSON") {
                    this.loadIntoMemory(file, memory, base).then(resolve).catch(reject);
                } else {
                    resolve(true);
                }
            });

        };

        return new Promise<any>(executor);
    }

    private collect(dir:string, memory:any, base:string): Promise<any> {
        Logger.info(`walking resource tree at ${dir}`);

        let executor = (resolve: (value?: any) => void, reject: (reason?:any) => void) => {
            fs.readdir(dir, (err:any, files:string[]) => {
                if(err) {
                    Logger.error(err);
                    resolve(true);
                    return;
                }
                Promise.all(files.map((file) => {
                    if(file === 'node_modules') {
                        return true;
                    }
                    return this.stat(path.join(dir, file), memory, base)
                })).then(resolve).catch(reject);
            });
        };
        return new Promise<any>(executor);
    }

    private webpack(context:string, entry:string, input:any): Promise<string> {
        Logger.info(`webpacking | ${entry} at ${context}`)
        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: string) => void) => {
            let config:any = {};
            let output:any = new MemoryFS();

            config.context = '/';
            config.entry = './'+ entry;
            config.output = {};
            config.target = 'node';

            config.output.path = '/';
            config.output.filename = 'platform.bundle.js';
            config.externals = {};

            config.resolve = {};
            config.resolve.root = path.join(context, 'node_modules');
            config.resolve.alias = {};

            for(const apiModule in apiModules) {
                config.resolve.alias[`upspark/${apiModule}`] = `/__internal__${apiModule}.js`;
            }

            config.resolve.extenstions = [];
            config.resolve.extenstions.push('');
            config.resolve.extenstions.push('.js');
            config.resolve.extenstions.push('.json');

            config.resolve.modulesDirectories = [];
            config.resolve.modulesDirectories.push(path.join(context, 'node_modules'));

            excludes.forEach((include:string) => config.externals[include] = `upspark['__internal'].require('${include}')`);

            config.externals['__context'] = '__context';

            let compiler:any = webpack(config);

            compiler.inputFileSystem = input;
            compiler.resolvers.normal.fileSystem = compiler.inputFileSystem;
            compiler.resolvers.context.fileSystem = compiler.inputFileSystem;
            compiler.outputFileSystem = output;

            compiler.run((err:any, stats:any) => {
                if(err) {
                    reject(err);
                    return;
                }

                let result = stats.toJson();
                if (result.errors.length) {
                    Logger.error(result.errors.join('\n'));
                }

                let code = output.readFileSync("/platform.bundle.js").toString();

                Logger.info(`webpacked | ${code.length} bytes`);

                resolve(code);
            });
        };
        return new Promise<string>(executor);
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

    load(comms:CommandUpdateCommunicator): Promise<Platform>  {
        let executor = (resolve: (value:Platform) => void, reject: (reason?: any) => void) => {

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
                    path.join(main, '../'),
                    path.basename(main)

                ]);

            })
            .then((values:any[]) => {
                let path: string = values[1];
                let entry: string = values[2];
                if(!values[0]) {
                    reject(this.error(
                        `The entry point ${entry}, could not be found at '${path}'`,
                        `Please double check your package.json file.'.`
                    ));
                    return;
                }

                return Promise.all([
                    this.memory,
                    this.collect(path, this.memory, path),
                    path,
                    entry,
                ]);
            })
            .then((values:any[]) => {
                return this.webpack(values[2], values[3], values[0]);
            })

            .then((source:string) => {
                let platform: Platform = new Platform(process);
                Logger.info('testing platform')
                        .line()
                        .line('SOURCE::WEBPACKED')
                        .line()
                        .block(source)
                        .line()
                        .line('SOURCE::WEBPACKED')
                        .line();

                source = `${source}upspark['__internal'].resolveMappings();`;

                let internalNodeModuleInsert:string = excludes.map((external) => `upspark['__internal'].modules.push("${external}");`).join("");
                let header:string = `${platformScripts["api"]}${internalNodeModuleInsert}`;

                try {
                    vm.runInNewContext(
                        `${header}${source}__postInit(upspark['__internal'].commands)`,
                        platform
                    );
                } catch(err) {
                    reject(err);
                }

                source = `
                    ${header}
                    upspark['__internal'].worker = true;
                    ${source}
                    upspark['__internal'].loaded = true;
                    ${platformScripts["executors"]}
                `;

                Logger.info(platform);

                return Promise.all([
                    this.savePlatformForWorker(source),
                    platform
                ])
            })
            .then((values:any[]) => {
                this.release();

                resolve(values[1]);
            })
            .catch((e) => {
                //Logger.finish('platform');
                reject(e ? (e.stack || e) : this.error());

                this.release();
            });
        };

        return new Promise<Platform>(executor);
    }

    private savePlatformForWorker(source: string):Promise<string> {
        Logger.info(`saving worker script | ${this.resources.platform}`);

        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
            fs.writeFile(this.resources.platform, source, (err:NodeJS.ErrnoException) => {
               if(err) {
                   reject(err);
                   return;
               }
               resolve(source);

               Logger.info('saved  worker');
            });
        };
        return new Promise<string>(executor);
    }
}