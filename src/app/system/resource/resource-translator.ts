import {ResourceModel} from "./resource-model";
export interface ResourceTranslator {

    deserialize<T extends ResourceModel>(contents: String) : T;

    serialize<T>(model: T) : string;

}