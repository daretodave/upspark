import {ResourceModel} from "./resource-model";
export interface ResourceTranslator {

    deserialize<T extends ResourceModel<T>>(contents: String) : T;

    serialize<T>(model: T) : string;

}