import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
export class SettingsComms extends PlatformCommsHandler {

    constructor(host:Host) {
        super(host, 'Settings');
    }

    init() {

    }

    static getSafeValue(host:Host,
                        key: string,
                        resolve: (message?: string) => any,
                        reject: (message?: string, syntax?:boolean) => any) {

    }

}