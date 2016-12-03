import {Upspark} from "../upspark";
import {ApiModule} from "../modules/api-module";
import {Safe} from "../modules/safe";

const util = require('util');
const tryRequire = require('try-require');
const modules:Map<string, ApiModule> = new Map<string, ApiModule>();

function register<T extends ApiModule>(module: { new(...args:any[]): T }):Platform {
    let resolve:ApiModule = new module();

    modules.set(resolve.package(), resolve);
    return this;
}

register(Safe);

const excludes:string[] = require('builtin-modules');

modules.forEach((value:ApiModule, path:string) => excludes.push(path));

export {excludes};

export class Platform {

    public upspark:Upspark;

    constructor(public reference:any) {
        this.upspark = new Upspark();
    }

    public getMessage():string {
        return util.inspect(this.upspark.commands);
    }

    public include(path:string) {
        if(!excludes.includes(path)) {
            throw `Could not find module ${path}`;
        }

        if(modules.has(path)) {
            let module:ApiModule = modules.get(path);

            module.upspark = this.upspark;
            return module;
        }
        return tryRequire(path);
    }

    public require: (path:string) => void = this.include.bind(this);

}