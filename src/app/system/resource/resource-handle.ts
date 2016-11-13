import {ResourceTranslator} from "./resource-translator";
import {JSONTranslator} from "./translators/translate-json";
import {ResourceMissingPolicy} from "./resource-missing-policy";
import {ResourceModel} from "./resource-model";
import {Resource} from "./resource";

const fs = require('fs');

export class ResourceHandle<T extends ResourceModel> {

    private promise:Promise<T>;

    constructor(
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

    private _load(onMissingPolicy: ResourceMissingPolicy, resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) {
        fs.readFile(this.path, this.format, (err: NodeJS.ErrnoException, data: string) => {

            if(err === null) {
                let resource:T = <T>this.translator.deserialize(data);
                resolve(resource);
                return;
            }

            if(err.code !== 'ENOENT' || onMissingPolicy === ResourceMissingPolicy.FAIL) {
                reject(err);
                return;
            }

            let resource:T = <T>(new this.type());

            if (onMissingPolicy === ResourceMissingPolicy.DEFAULT || onMissingPolicy === ResourceMissingPolicy.CREATE_DEFAULT) {
                resource.toDefaultState();
            }

            if(onMissingPolicy === ResourceMissingPolicy.CREATE_BLANK || onMissingPolicy === ResourceMissingPolicy.CREATE_DEFAULT) {

                let contents = this.translator.serialize(resource);

                fs.writeFile(this.path, contents, (err: NodeJS.ErrnoException) => {
                    if(err !== null) {
                        reject(err);
                        return;
                    }
                    resolve(resource);
                });

            } else {
                resolve(resource);
            }

        });
    }

    reload(onMissingPolicy: ResourceMissingPolicy = this.onMissingPolicy): Promise<T> {
        this.promise = null;
        return this.load(onMissingPolicy);
    };

    load(onMissingPolicy: ResourceMissingPolicy = this.onMissingPolicy): Promise<T> {

        if(this.promise != null) {
            return this.promise;
        }

        let executor = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => {

            let task = () => {
                this._load(onMissingPolicy, resolve, reject);
            };

            if(this.resource != null) {
                this.resource.init(task, reject);
            } else {
                task();
            }

        };

        this.promise = new Promise<T>(executor);

        return this.promise;
    }

}