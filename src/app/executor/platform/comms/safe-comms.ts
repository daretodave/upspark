import {PlatformCommsHandler} from "../platform-comms-handler";
import {PlatformCommsAction} from "../platform-comms-action";
import {Host} from "../../../model/host";
export class SafeComms extends PlatformCommsHandler {

    constructor(host:Host) {
        super(host, 'Safe');
    }

    init() {
        this.add('get', this.getSafeValue, {
            'key': 'safe value\'s key'
        });
    }

    getSafeValue(parameters: any,
                 host:Host,
                 resolve: (message?: string) => any,
                 reject: (message?: string, syntax?:boolean) => any) {

        if(!parameters) {
            reject(`Provide the key argument when getting values from the safe.`, true);
            return;
        }

        return 'TEST RESPONSE';
    }

}