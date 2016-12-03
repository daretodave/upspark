const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

export class Util {

    public static getArgumentNames(func:any):string[] {
        let fnStr = func.toString().replace(STRIP_COMMENTS, '');
        let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if(result === null)
            result = [];
        return result;
    }

    public static toArray(args:any): any[] {
        return Array.isArray(args) ? args : Array.from(arguments);
    }

    public static isFunction(functionToCheck:any) {
        let getType:any = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

}