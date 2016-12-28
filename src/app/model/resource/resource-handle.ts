import {ResourceTranslator} from "./resource-translator";
import {JSONTranslator} from "./translators/translate-json";
import {ResourceMissingPolicy} from "./resource-missing-policy";
import {ResourceModel} from "./resource-model";
import {Resource} from "./resource";
import {Logger} from "../logger/logger";

const fs = require('fs');

export class ResourceHandle<T extends ResourceModel> {

    private promise:Promise<T>;
    private model:T;

    constructor(
        private key: string,
        private path: string,
        private type: { new(...args: any[]): T },
        private onMissingPolicy: ResourceMissingPolicy = ResourceMissingPolicy.CREATE_DEFAULT,
        private format: string = 'utf8',
        private translator: ResourceTranslator = new JSONTranslator(),
        private resource: Resource = null) {
    }

    setFormat(format: string): ResourceHandle<T> {
        this.format = format;
        return this;
    }

    setOnMissingPolicy(onMissingPolicy: ResourceMissingPolicy): ResourceHandle<T> {
        this.onMissingPolicy = onMissingPolicy;
        return this;
    }

    setTranslator(translator: ResourceTranslator): ResourceHandle<T> {
        this.translator = translator;
        return this;
    }

    save(log:boolean = true): Promise<T> {
        let executor = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => {
            this._save(resolve, reject, log);
        };
        return new Promise<T>(executor);
    }

    get(): T {
        return this.model;
    }

    private _save(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void, log: boolean = true, reload:boolean = false) {
        if (log) {
            Logger.info(`${reload ? 'creating' : 'saving'} resource '${this.key}'`);
        }
        let contents:string = this.translator.serialize(this.model);
        fs.writeFile(this.path, contents, (err: NodeJS.ErrnoException) => {
            if(err !== null) {
                reject(err);
                return;
            }
            if (log) {
                Logger.info(`${reload ? 'created' : 'saved '} resource '${this.key}'`);
            }

            resolve(this.model);
        });
    }

    private _load(onMissingPolicy: ResourceMissingPolicy, resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void, reload:boolean = false) {
        fs.readFile(this.path, this.format, (err: NodeJS.ErrnoException, data: string) => {

            if(err === null) {
                Logger.info(`resource '${this.key}' is ${reload ? 're' : ''}loaded`);
                this.model  = <T>this.translator.deserialize(this.type, data);
                resolve(this.model);
                return;
            }

            if(err.code !== 'ENOENT' || onMissingPolicy === ResourceMissingPolicy.FAIL) {
                reject(err);
                return;
            }

            this.model = <T>(new this.type());
            let defaulted:boolean = onMissingPolicy === ResourceMissingPolicy.DEFAULT || onMissingPolicy === ResourceMissingPolicy.CREATE_DEFAULT;

            if (defaulted) {
                this.model.toDefaultState();
            }

            if(onMissingPolicy === ResourceMissingPolicy.CREATE_BLANK || onMissingPolicy === ResourceMissingPolicy.CREATE_DEFAULT) {
                Logger.info(`resource '${this.key}' was not found | creating a${defaulted ? ' defaulted' : 'n empty'} resource and saving to disk`);
                this._save(resolve, reject, true, true);
            } else {
                Logger.info(`resource '${this.key}' was not found | using a${defaulted ? ' defaulted' : 'n empty'} resource`);
                resolve(this.model);
            }

        });
    }

    reload(onMissingPolicy: ResourceMissingPolicy = this.onMissingPolicy): Promise<T> {
        this.promise = null;
        return this.load(onMissingPolicy, true);
    };

    load(onMissingPolicy: ResourceMissingPolicy = this.onMissingPolicy, reload:boolean = false): Promise<T> {

        if(this.promise != null) {
            return this.promise;
        }

        Logger.info(`resource '${this.key}' is ${reload ? 're': ''}loading from ${this.path}`);

        let executor = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => {

            let task = () => {
                this._load(onMissingPolicy, resolve, reject, reload);
            };

            if(this.resource !== null) {
                this.resource.init(task, reject);
            } else {
                task();
            }

        };

        this.promise = new Promise<T>(executor);

        return this.promise;
    }

}