export interface ResourceTranslator {

    deserialize<T>(contents: String) : T;

    serialize<T>(model: T) : string;

}