import {PlatformCommsHandler} from "../platform-comms-handler";
import {PlatformCommsAction} from "../platform-comms-action";
import {Host} from "../../../model/host";
export class SafeComms extends PlatformCommsHandler {

    constructor(host:Host) {
        super(host, 'SAFE');
    }

    init(handlers: Map<string, PlatformCommsAction>) {
        handlers.set('GET', this.getSafeValue);
    }

    getSafeValue(parameters: any,
                 host:Host,
                 resolve: (message?: string) => any,
                 reject: (message?: string) => any) {

        return 'TEST RESPONSE';
    }

}