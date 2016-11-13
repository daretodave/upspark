import {ResourceTranslator} from "../resource-translator";
export class JSONTranslator implements ResourceTranslator {

    deserialize<T>(contents: string): T {
        return JSON.parse(contents);
    }

    serialize<T>(model: T): string {
        return JSON.stringify(model, null, 4);
    }

}