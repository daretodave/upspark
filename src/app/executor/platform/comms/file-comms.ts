import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
import * as path from 'path';
import * as fs from 'fs-promise';
export class FileComms extends PlatformCommsHandler {

    constructor(host: Host) {
        super(host, 'File');
    }

    init() {
        this.add('write', FileComms.write, {
            'path': 'File location to write contents to',
            'contents': 'The contents of the file'
        });
    }

    static resolveContents(contents:any):string {
        if(typeof contents === 'undefined') {
            return '';
        }

        if(Array.isArray(contents)) {
            return contents.join('');
        }

        return contents;
    }

    static resolvePath(host:Host, _path:any):string {
        if (typeof _path === 'undefined') {
            return null;
        }

        if (Array.isArray(_path)) {
            _path = path.join(..._path);
        }

        _path = _path.toString();

        if(!path.isAbsolute(_path)) {
            _path = path.join(host.cwd(), _path);
        }

        return _path;
    }

    static write(host:Host,
                 options: any,
                 resolve: (message?: any) => any,
                 reject: (message?: string, syntax?: boolean) => any) {

        let path:string = FileComms.resolvePath(
            host,
            options.path
        );
        let contents:string = FileComms.resolveContents(
            options.contents
        );

        if(!path) {
            reject('No path provided', true);
            return;
        }

        fs.writeFile(
            path,
            contents
        )
        .then(() => resolve(''))
        .catch(reject);
    }

}