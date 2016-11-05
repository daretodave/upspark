import {ResourceModel} from "./resource-model";
export class ResourcePromise<T extends ResourceModel<T>> extends Promise<T> {

    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        super(executor);
    }

}