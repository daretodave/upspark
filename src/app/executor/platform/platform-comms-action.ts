import {Host} from "../../model/host";
export interface PlatformCommsAction {
    (parameters:any, host:Host, resolve:(message?:string) => any, reject:(message?:string, syntax?:boolean) => any):any
}