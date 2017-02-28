import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
export class NetComms extends PlatformCommsHandler {

    constructor(host: Host) {
        super(host, 'Net');
    }

    init() {
    }

}