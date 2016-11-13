import {ResourceTranslator} from "../resource-translator";
export class TextTranslator implements ResourceTranslator {

    deserialize<T>(contents: string): T {
        let model = {};
        model["content"] = contents;
        return <T>model;
    }

    serialize<T>(model: T): string {
        return model["content"];
    }

}