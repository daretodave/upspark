import {Logger} from "../model/logger/logger";
const STRIP_COMMENTS: RegExp = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES: RegExp = /([^\s,]+)/g;
const shell = require('electron').shell;
const fileUrl = require('file-url');

export class Util {

    public static getArgumentNames(func: any): string[] {

        let fnStr = func.toString().replace(STRIP_COMMENTS, '');
        let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (result === null)
            result = [];
        return result;
    }

    public static toArray(args: any): any[] {
        return Array.isArray(args) ? args : Array.from(arguments);
    }

    public static isFunction(functionToCheck: any): boolean {
        let getType: any = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    public static compose(derived: any, base: any[]) {
        base.forEach(
            base => Object.getOwnPropertyNames(base.prototype)
                .forEach(
                    name => derived.prototype[name] = base.prototype[name]
                )
        );
    }

    public static openFile(path:String):boolean {
        path = fileUrl(path);

        Logger.info(`Opening file @ ${path}`);

        return shell.openExternal(path, {
            activate: true
        }, (err:any) => {
            if (err) {
               Logger.error(`Could not open ${path}`, err)
            }
        });
    }

}