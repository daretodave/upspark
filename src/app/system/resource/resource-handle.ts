import {ResourcePromise} from "./resource-promise";
import {ResourceTranslator} from "./resource-translator";
import {JSONTranslator} from "./translators/translate-json";
import {ResourceMissingPolicy} from "./resource-missing-policy";
import {ResourceModel} from "./resource-model";

const fs = require('fs');

export class ResourceHandle<T extends ResourceModel<T>> {

    private promise:ResourcePromise<T>;

    constructor(
        private path: string,
        private type: T,
        private onMissingPolicy: ResourceMissingPolicy = ResourceMissingPolicy.CREATE_DEFAULT,
        private format: string = 'utf8',
        private translator: ResourceTranslator = new JSONTranslator()) {
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

    load(onMissingPolicy: ResourceMissingPolicy = this.onMissingPolicy): ResourcePromise<T> {
        if(this.promise != null) {
            return this.promise;
        }

        let executor = function (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) {
            fs.readFile(this.path, this.format, (err: NodeJS.ErrnoException, data: string) => {
                if(err === null) {
                    let resource:T = this.translator.deserialize(data);
                    resolve(resource);
                    return;
                }
                if(err.code !== 'ENOENT' || onMissingPolicy === ResourceMissingPolicy.FAIL) {
                    reject(err);
                    return;
                }
                let resource:T = new this.type();

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
        };
        return new ResourcePromise<T>(executor);
    }

}