import {ResourceTranslator} from "../resource-translator";
export class JSONTranslator implements ResourceTranslator {

    deserialize<T>(contents: String): T {
        return JSON.parse(contents);
    }

    serialize<T>(model: T): string {
        return JSON.stringify(model);
    }

}