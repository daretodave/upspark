import {ResourceHandle} from "./resource-handle";
export class Resource {

    private resources:Map<string, ResourceHandle>;

    constructor(public path: string) {
    }

    attach(path: string) {
    }

}