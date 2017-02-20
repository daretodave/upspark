import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
import * as path from 'path';

const {shell} = require('electron');

export class DesktopComms extends PlatformCommsHandler {

    constructor(host: Host) {
        super(host, 'Desktop');
    }

    init() {

        this.add('beep', DesktopComms.beep);
        this.add('openLocation', DesktopComms.openLocation);
        this.add('moveItemToTrash', DesktopComms.moveItemToTrash, {
            path: 'The location of the file to delete'
        });
        this.add('open', DesktopComms.open, {
            path: 'The location of the file to open'
        });
        this.add('openURI', DesktopComms.openURI, {
            path: 'A URI/URL to attempt to open'
        });
    }

    static moveItemToTrash(host:Host,
                           location:string,
                           resolve: (message?: any) => any,
                           reject: (message?: string, syntax?: boolean) => any) {

        if(!location) {
            reject('Provide the path of the target');
            return;
        }
        if (!path.isAbsolute(location)) {
            location = path.join(host.cwd(), location);
        }

        return shell.moveItemToTrash(location);
    }

    static openURI(host:Host,
                location:string,
                resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {

        if(!location) {
            reject('Provide the URI of the target');
            return;
        }

        return shell.openExternal(location);
    }

    static openLocation(host:Host, location:string) {

        if(!location) {
            location = host.cwd();
        }

        if (!path.isAbsolute(location)) {
            location = path.join(host.cwd(), location);
        }

        return shell.showItemInFolder(location);
    }

    static open(host:Host,
                location:string,
                           resolve: (message?: any) => any,
                           reject: (message?: string, syntax?: boolean) => any) {

        if(!location) {
            reject('Provide the path of the target');
            return;
        }
        if (!path.isAbsolute(location)) {
            location = path.join(host.cwd(), location);
        }

        return shell.openItem(location);
    }


    static beep() {
        shell.beep();

        return true;
    }

}