import {ResourceHandle} from "./resource-handle";
import {ResourceTranslator} from "./resource-translator";
import {JSONTranslator} from "./translators/translate-json";
import {ResourceMissingPolicy} from "./resource-missing-policy";
import {ResourceModel} from "./resource-model";
import {Logger} from "../logger/logger";

const _path = require('path');
const fs = require('fs');

export class Resource {

    private resources:Map<string, ResourceHandle<any>>;

    constructor(public root: string, public platform:string) {
        this.resources = new Map<string, ResourceHandle<any>>();
    }

    private validateProvidedKey(key: string, validateExists: boolean = false) {
        if(key === null) {
            throw Error('No key provided');
        }
        if((typeof key) !== 'string') {
            throw Error(`Key must be a string! Key = [${key}]`);
        }
        if(key.length === 0) {
            throw Error('Key can not be an empty string');
        }
        if(validateExists && !this.resources.has(key)) {
            throw Error(`Key provided can not be found in resource map! Key = [${key}]`);
        }
    }

    init(resolve: () => void, reject: (reason? : any) => void) {
        fs.mkdir(this.root, 777, (error: NodeJS.ErrnoException) => {

            if(error != null && error.code !== 'EEXIST') {
                reject(error);
                return;
            }

            resolve();

        });
    }

    attach<T extends ResourceModel>(path: string, type: { new(...args: any[]): T }, translator: ResourceTranslator = new JSONTranslator(), key:string = null, onMissingPolicy: ResourceMissingPolicy = ResourceMissingPolicy.CREATE_DEFAULT): ResourceHandle<T> {
        if(key === null) {
            let ext: string = _path.extname(path);

            if (ext.length !== 0) {
                key = _path.basename(path, ext);
            } else {
                key = _path.basename(path);
            }

        }
        let handle: ResourceHandle<T> = new ResourceHandle(key, _path.join(this.root, path), type, onMissingPolicy, 'utf8', translator, this);


        this.validateProvidedKey(key);

        this.resources.set(key, handle);

        return handle;
    }

    release(key:string) {
        this.validateProvidedKey(key, false);

        Logger.info(`resource '${key}' is being released`);

        if(!this.resources.has(key)) {
            Logger.info(`resource '${key}' was not found | release complete`);
            return;
        }
    }

    deleteIfExists<T extends ResourceModel>(key: string, log: boolean = true): Promise<boolean> {
        this.validateProvidedKey(key, true);

        return this.resources.get(key).deleteIfExists(log);
    }

    save<T extends ResourceModel>(key: string, log: boolean = true): Promise<boolean> {
        this.validateProvidedKey(key, true);

        return this.resources.get(key).save(log);
    }

    reload<T extends ResourceModel>(key: string): Promise<T> {
        this.validateProvidedKey(key, true);

        return this.resources.get(key).reload();
    }

    load<T extends ResourceModel>(key: string): Promise<T> {
        this.validateProvidedKey(key, true);

        return this.resources.get(key).load();
    }

    get<T>(key: string): Promise<T> {
        this.validateProvidedKey(key, true);

        return this.load(key).then(function(resource:any) {
            return resource;
        });
    }

    syncGet<T>(key: string): T {
        this.validateProvidedKey(key, true);

        return this.resources.get(key).get();
    }
}