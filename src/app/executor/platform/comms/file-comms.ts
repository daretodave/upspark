import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
import * as path from 'path';
import * as fs from 'fs-promise';
import {WriteJsonOptions} from "fs-promise";
import {ReadJsonOptions} from "fs-promise";

type FS_WRITE_OPTIONS = { encoding?: string;
    mode?: number;
    flag?: string;};
type FS_READ_OPTIONS = { encoding?: "buffer" | null; flag?: string; } | "buffer" | null;

export class FileComms extends PlatformCommsHandler {

    constructor(host: Host) {
        super(host, 'File');
    }


    init() {

        this.add('write', FileComms.write, {
            'path': 'File location to write the contents to',
            'contents': 'The contents of the file',
            'options': 'Optional options for fs.writeFile'
        });

        this.add('rename', FileComms.rename, {
            'path': 'Directory or file to rename',
            'name': 'The path\'s new name'
        });

        this.add('createFile', FileComms.createFile, {
            'path': 'File location to write the contents to',
            'contents': 'The contents of the file',
            'options': 'Optional options for fs.writeFile'
        });

        this.add('append', FileComms.append, {
            'path': 'File location to append the contents to',
            'contents': 'The contents to append to the existing file contents',
            'options': 'Optional options for fs.appendFile'
        });

        this.add('move', FileComms.move, {
            'src': 'The source file or directory',
            'dst': 'The destination file or directory'
        });

        this.add('copy', FileComms.copy, {
            'src': 'The source file or directory',
            'dst': 'The destination file or directory'
        });

        this.add('read', FileComms.read, {
            'path': 'File location to read the contents from',
            'options': 'Optional options for fs.readFile'
        });

        this.add('writeJSON', FileComms.writeJSON, {
            'path': 'File location to write the JSON to',
            'contents': 'The serializable object',
            'options': 'The options to pass to JSON parser'
        });

        this.add('readJSON', FileComms.readJSON, {
            'path': 'File location to read the JSON from',
            'options': 'Optional options for the JSON parser'
        });

        this.add('resolve', FileComms.resolve, {
            '...path': 'The path to construct from the CWD'
        });

        this.add('remove', FileComms.remove, {
            'path': 'Directory or file to delete'
        });

        this.add('list', FileComms.list, {
            'path': 'Directory to crawl and search for files',
        });

        this.add('createPath', FileComms.createPath, {
            'path': 'Directory to create, only if not created',
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

    static read(host:Host,
                {path, options}: any,
                resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {

        if(!path) {
            reject('No path provided', true);
            return;
        }

        path = FileComms.resolvePath(
            host,
            path
        );

        fs.readFile(
                path,
                <FS_READ_OPTIONS>options
           ).then(contents => resolve(contents.toString()))
            .catch(reject)
    }

    static readJSON(host:Host,
                {path, options}: any,
                resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {

        if(!path) {
            reject('No path provided', true);
            return;
        }

        path = FileComms.resolvePath(
            host,
            path
        );

        fs.readJSON(
            path,
            <ReadJsonOptions>options
        ).then(contents => resolve(contents))
         .catch(reject)
    }

    static list(host:Host,
                {path}: any,
                resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {

        path = FileComms.resolvePath(
            host,
            path
        );

        if(!path) {
            reject('No path provided', true);
            return;
        }

        fs.readdir(path)
            .then((files:string[]) => resolve(files))
            .catch(reject);
    }

    static resolve(host:Host,
                {path}: any,
                resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {

        path = FileComms.resolvePath(
            host,
            path
        );

        if(!path) {
            reject('No path provided', true);
            return;
        }

        resolve(path);
    }

    static remove(host:Host,
                {path}: any,
                resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {

        path = FileComms.resolvePath(
            host,
            path
        );

        if(!path) {
            reject('No path provided', true);
            return;
        }

        fs.remove(path)
            .then(() => resolve(''))
            .catch(reject);
    }

    static move(host:Host,
                {src, dst}:any,
                resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {

        src = FileComms.resolvePath(
            host,
            src
        );

        dst = FileComms.resolvePath(
            host,
            dst
        );

        if(!src) {
            reject('No source path provided', true);
            return;
        }

        if(!dst) {
            reject('No destination path provided', true);
            return;
        }

        fs.move(src, dst)
            .then(() => resolve(''))
            .catch(reject)
    }

    static copy(host:Host,
        {src, dst}:any,
                resolve: (message?: any) => any,
                reject: (message?: string, syntax?: boolean) => any) {

        src = FileComms.resolvePath(
            host,
            src
        );

        dst = FileComms.resolvePath(
            host,
            dst
        );

        if(!src) {
            reject('No source path provided', true);
            return;
        }

        if(!dst) {
            reject('No destination path provided', true);
            return;
        }

        fs.copy(src, dst)
            .then(() => resolve(''))
            .catch(reject)
    }

    static rename(host:Host,
                 {target, name}: any,
                  resolve: (message?: any) => any,
                  reject: (message?: string, syntax?: boolean) => any) {

        target = FileComms.resolvePath(
            host,
            target
        );

        if(!target) {
            reject('No path provided', true);
            return;
        }

        if(!name) {
            reject('No new name provided', true);
            return;
        }

        name = path.join(
            path.dirname(target),
            name
        );

        fs.rename(target, name)
            .then(() => resolve(''))
            .catch(reject);
    }

    static write(host:Host,
                {contents, path, options}: any,
                 resolve: (message?: any) => any,
                 reject: (message?: string, syntax?: boolean) => any) {

        path = FileComms.resolvePath(
            host,
            path
        );

        contents = FileComms.resolveContents(
            contents
        );

        if(!path) {
            reject('No path provided', true);
            return;
        }

        fs.outputFile(
            path,
            contents,
            <FS_WRITE_OPTIONS> options
        )
            .then(() => resolve(''))
            .catch(reject);
    }

    static writeJSON(host:Host,
                 {path, contents, options}: any,
                 resolve: (message?: any) => any,
                 reject: (message?: string, syntax?: boolean) => any) {

        path = FileComms.resolvePath(
            host,
            path
        );

        if(!path) {
            reject('No path provided', true);
            return;
        }

        if(!contents) {
            reject('No JSON contents provided', true);
            return;
        }

        fs.outputJSON(
            path,
            contents,
            <WriteJsonOptions> options
        )
        .then(() => resolve(''))
        .catch(reject);
    }

    static createFile(host:Host,
                {contents, path, options}: any,
                 resolve: (message?: any) => any,
                 reject: (message?: string, syntax?: boolean) => any) {

        path = FileComms.resolvePath(
            host,
            path
        );

        contents = FileComms.resolveContents(
            contents
        );

        if(!path) {
            reject('No path provided', true);
            return;
        }

        fs.ensureFile(path)
            .then(() => {
                return fs.writeFile(
                    path,
                    contents,
                    <FS_WRITE_OPTIONS> options
                )
            })
            .then(() => resolve(''))
            .catch(reject);
    }

    static append(host:Host,
        {contents, path, options}: any,
                 resolve: (message?: any) => any,
                 reject: (message?: string, syntax?: boolean) => any) {

        path = FileComms.resolvePath(
            host,
            path
        );

        contents = FileComms.resolveContents(
            contents
        );

        if(!path) {
            reject('No path provided', true);
            return;
        }

        fs.appendFile(
                path,
                contents,
                <FS_WRITE_OPTIONS> options
            )
            .then(() => resolve(''))
            .catch(reject);
    }

    static createPath(host:Host,
                {path}: any,
                 resolve: (message?: any) => any,
                 reject: (message?: string, syntax?: boolean) => any) {
        path = FileComms.resolvePath(
            host,
            path
        );

        if(!path) {
            reject('No path provided', true);
            return;
        }

        fs.ensureDir(path)
            .then(() => resolve(''))
            .catch(reject);
    }

}