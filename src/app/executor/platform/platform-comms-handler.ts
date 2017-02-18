import {PlatformCommsAction} from "./platform-comms-action";
import {Host} from "../../model/host";
export abstract class PlatformCommsHandler {

    private handlers:Map<string, PlatformCommsAction>;
    private title:string;
    private host:Host;

    constructor(host:Host, title:string) {
        this.handlers = new Map<string, PlatformCommsAction>();
        this.title = title;
        this.host = host;

        this.init(this.handlers);
    }

    handle(
        action:string,
        parameters:any,
        resolve:(message?:string) => any,
        reject:(message?:string) => any) {

        if(!this.handlers.has(action)) {
            reject(`${action} not found in the '${this.title}' handler`);
        }

        let handler:PlatformCommsAction = this.handlers.get(action);

        try {
            let response = handler(
                parameters,
                this.host,
                resolve,
                reject
            );
            if (typeof response === 'string') {
                resolve(response);
            }

        } catch(err) {
            reject(err.message);
        }
    }

    abstract init(handlers:Map<string, PlatformCommsAction>) : any;

}