import {Upspark} from "../upspark";
import {ApiModule} from "../modules/api-module";
import {Safe} from "../modules/safe";
import {Util} from "../util";
import {Command} from "../command";
import * as _ from 'lodash';
import {Renderer} from "../modules/renderer";

const util = require('util');
const tryRequire = require('try-require');
const modules:Map<string, ApiModule> = new Map<string, ApiModule>();

function register(...apiModules: { new(...args:any[]): ApiModule }[]):Platform {
    apiModules.forEach((module: { new(...args:any[]): ApiModule }) => {
        let resolve:ApiModule = new module();

        modules.set(resolve.package(), resolve);
    });
    return this;
}

register(
    Safe,
    Renderer
);

const excludes:string[] = require('builtin-modules');

modules.forEach((value:ApiModule, path:string) => excludes.push(path));

export {excludes};

export class Platform {

    public upspark:Upspark;

    constructor(public reference:any) {
        this.upspark = new Upspark(this);
    }

    public getMessage():string {
        let commands:any[] = [];
        let message:string[] = [];

        this.upspark.commands.forEach((value:Command, command:string) => {
            let resolve:any = {};
            resolve.context = value.context;
            resolve.command = command;
            if(!Util.isFunction(value.executor)) {
                resolve.message = ` = '${value.executor}'`;
            } else {
                resolve.message = `(${Util.getArgumentNames(value.executor).join(', ')})`;
            }
            commands.push(resolve);
        });
        commands = _.sortBy(commands, ['context', 'command']);

        message.push("commands");

        commands.forEach((command:any) => message.push(`@[${command.context}]\t\t${command.command}${command.message}`));

        return message.join("\n");
    }

    private setContext(path:string) {
        this.upspark.context = path;
    }

    private include(path:string) {
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

    public __context: (path:string) => void = this.setContext.bind(this);
    public require: (path:string) => void = this.include.bind(this);

}