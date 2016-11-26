import {ResourceModel} from "../../system/resource/resource-model";

declare let APP_VERSION:string;
export const DEFAULT_MAIN:string = 'platform.js';

export class PlatformPackage implements  ResourceModel {

    public name:string;
    public version:string;
    public main:string;

    toDefaultState(): void {
        this.name = 'upspark-platform';
        this.version = APP_VERSION;
        this.main = 'platform.js';
    }

}