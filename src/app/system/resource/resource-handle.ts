import {ResourcePromise} from "./resource-promise";
import {ResourceTranslator} from "./resource-translator";
export class ResourceHandle<T> {

    constructor(private path: string, private translator: ResourceTranslator) {
    }

    save(): ResourcePromise {
        let promise:ResourcePromise = new ResourcePromise();

        return promise;
    }

}