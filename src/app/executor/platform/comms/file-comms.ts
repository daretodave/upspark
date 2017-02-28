import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
export class FileComms extends PlatformCommsHandler {

    constructor(host: Host) {
        super(host, 'File');
    }

    init() {
    }

}