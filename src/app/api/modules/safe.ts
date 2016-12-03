import {ApiModule} from "./api-module";
import {Logger} from "../../system/logger/logger";
export class Safe extends ApiModule {

    package(): string {
        return 'upspark/safe';
    }

    public get(key:string) {
        Logger.info(`safe, attempting to fetch '${key}'`);
    }

}