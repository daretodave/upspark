export class ResourcePromise<T> extends Promise<T> {

    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        super(executor);
    }

}