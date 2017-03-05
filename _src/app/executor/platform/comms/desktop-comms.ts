import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
import * as path from 'path';
import {Util} from "../../../util/util";
const {shell, clipboard} = require('electron');

export class DesktopComms extends PlatformCommsHandler {

    constructor(host: Host) {
        super(host, 'Desktop');
    }

    init() {

        this.add('beep', DesktopComms.beep);
        this.add('openLocation', DesktopComms.openLocation);

        this.add('setFindText', DesktopComms.setFindText);
        this.add('setClipboard', DesktopComms.setClipboard);

        this.add('getClipboardFormats', DesktopComms.getClipboardFormats);
        this.add('getClipboardBookmark', DesktopComms.getClipboardBookmark);
        this.add('getClipboardRTF', DesktopComms.getClipboardRTF);
        this.add('getClipboardImage', DesktopComms.getClipboardImage);
        this.add('getClipboardHTML', DesktopComms.getClipboardHTML);
        this.add('getClipboardText', DesktopComms.getClipboardText);
        this.add('getFindText', DesktopComms.getFindText);

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

    static getClipboardBookmark(host:Host, format:string) {
        if (format && typeof format === 'string') {
            return clipboard.readBookmark(format);
        }

        return clipboard.readBookmark();
    }

    static getClipboardRTF(host:Host, format:string) {
        if (format && typeof format === 'string') {
            return clipboard.readRTF(format);
        }

        return clipboard.readRTF();
    }

    static getClipboardImage(host:Host, format:string) {
        if (format && typeof format === 'string') {
            return clipboard.readImage(format).toDataURL();
        }

        return clipboard.readImage().toDataURL();
    }

    static getClipboardHTML(host:Host, format:string) {
        if (format && typeof format === 'string') {
            return shell.readHTML(format);
        }

        return clipboard.readHTML();
    }

    static getClipboardText(host:Host, format:string) {
        if (format && typeof format === 'string') {
            return clipboard.readText(format);
        }

        return clipboard.readText();
    }

    static setClipboard(host: Host,
                        {mappings, type}:any) {


        if (mappings
            && mappings.image
            && !path.isAbsolute(mappings.image)) {

            mappings.image = path.join(host.cwd(), mappings.image);
        }

        if(type && typeof type === 'string') {
            return clipboard.write(mappings, type) || '';
        }

        return clipboard.write(mappings) || '';
    }

    static getClipboardFormats(host: Host, format: string) {

        if (format && typeof format === 'string') {
            return clipboard.availableFormats(format);
        }

        return clipboard.availableFormats();
    }

    static getFindText() {

        return clipboard.readFindText();
    }

    static setFindText(host: Host,
                       text: string) {
        text = text || '';

        return clipboard.writeFindText(text) || '';
    }

    static openURI(host: Host,
                   location: string,
                   resolve: (message?: any) => any,
                   reject: (message?: string, syntax?: boolean) => any) {

        if (!location) {
            reject('Provide the URI of the target', true);
            return;
        }

        return shell.openExternal(location);
    }

    static moveItemToTrash(host: Host,
                           location: string,
                           resolve: (message?: any) => any,
                           reject: (message?: string, syntax?: boolean) => any) {

        if (!location) {
            reject('Provide the path of the target', true);
            return;
        }
        if (!path.isAbsolute(location)) {
            location = path.join(host.cwd(), location);
        }

        return shell.moveItemToTrash(location);
    }

    static openLocation(host: Host, location: string) {

        if (!location) {
            location = host.cwd();
        }

        if (!path.isAbsolute(location)) {
            location = path.join(host.cwd(), location);
        }

        return shell.showItemInFolder(location);
    }

    static open(host: Host,
                location: string,
                resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {

        if (!location) {
            reject('Provide the path of the target', true);
            return;
        }
        if (!path.isAbsolute(location)) {
            location = path.join(host.cwd(), location);
        }

        return Util.openFile(location);
    }


    static beep() {
        shell.beep();

        return true;
    }

}