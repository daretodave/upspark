import {Platform} from "../api/platform/platform";
import {Resource} from "../system/resource/resource";
export interface InternalCommandHooks {

    onPlatformUpdate(platform:Platform):any;

    getResources():Resource;

}