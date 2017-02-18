import {Host} from "../../model/host";
export interface PlatformCommsAction {
    (host:Host, parameters:any, resolve:(message?:any) => any, reject:(message?:string, syntax?:boolean) => any):any
}