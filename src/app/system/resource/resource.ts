import {ResourceHandle} from "./resource-handle";
import {ResourceTranslator} from "./resource-translator";
import {JSONTranslator} from "./translators/translate-json";
import {ResourcePromise} from "./resource-promise";
import {ResourceMissingPolicy} from "./resource-missing-policy";
import {ResourceModel} from "./resource-model";

const _path = require('path');
const fs = require('fs');

export class Resource {

    private resources:Map<string, ResourceHandle<any>>;

    constructor(public root: string) {
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

            if(error != null || error.code !== 'EEXIST') {
                reject(error);
                return;
            }

            resolve();

        });
    }

    attach<T extends ResourceModel>(path: string, type: { new(...args: any[]): T }, key:string = null, translator: ResourceTranslator = new JSONTranslator(), onMissingPolicy: ResourceMissingPolicy = ResourceMissingPolicy.CREATE_BLANK): ResourceHandle<T> {
        let handle: ResourceHandle<T> = new ResourceHandle(_path.join(this.root, path), type, onMissingPolicy, 'utf8', translator, this);

        if(key === null) {
            let ext: string = _path.extname(path);

            if(ext.length !== 0) {
                key = _path.basename(path, '.' + ext);
            } else {
                key = _path.basename(path);
            }
        }

        this.validateProvidedKey(key);

        this.resources.set(key, handle);

        return handle;
    }

    load<T extends ResourceModel>(key: string): ResourcePromise<T> {
        this.validateProvidedKey(key, true);

        return this.resources.get(key).load();
    }

}