import {ResourceTranslator} from "../../system/resource/resource-translator";
import {Platform} from "./platform";
export class PlatformTranslator implements ResourceTranslator {

    deserialize(type: { new(...args: any[]): Platform }, contents: string): Platform {
        return new Platform();
    }

    serialize(model: Platform): string {
        return undefined;
    }

}