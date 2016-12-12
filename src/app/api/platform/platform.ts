import {Util} from "../util";
import * as _ from 'lodash';
import {Logger} from "../../system/logger/logger";
import Process = NodeJS.Process;
const util = require('util');
const tryRequire = require('try-require');

const excludes:string[] = require('builtin-modules');
const apiModules:any = {
    safe: require('raw!../modules/safe.js')
};
export {excludes, apiModules};

export class Platform {

    private commands:any[];

    constructor(public process:Process) {
    }

    public hasCommandMapped(command:string): boolean {
        return this.commands.hasOwnProperty(command);
    }

    public getMessage():string {
        let commands:any[] = [];
        let message:string[] = [];

        for(let title in this.commands) {
            if(!this.commands.hasOwnProperty(title)) {
                continue;
            }
            let mapping = this.commands[title];
            let resolve:any = {};

            resolve.context = mapping.context;
            resolve.command = title;

            if(mapping.split) {
                resolve.command += `[${mapping.split}]`;
            }

            if(!Util.isFunction(mapping.processor)) {
                resolve.message = ` = '${mapping.processor}'`;
            } else {
                resolve.message = `(${Util.getArgumentNames(mapping.processor).join(', ')})`;
            }

            commands.push(resolve);
        }

        message.push("commands");

        commands = _.sortBy(commands, ['context', 'command']);
        commands.forEach((command:any) => message.push(`@[${command.context}]\t\t${command.command}${command.message}`));

        return message.join("\n");
    }

    __log(message:string, isError:boolean) {
        Logger[isError ? 'error' : 'info'](message);
    }
    postInit(commands:any[]) {
        this.commands = commands;
    }

    public require: (path:string) => void = Platform.include.bind(this);
    public __postInit: (command:any[]) => void = this.postInit.bind(this);

    private static include(path:string) {
        if(!excludes.includes(path)) {
            throw `Could not find module ${path}`;
        }
        return tryRequire(path);
    }


}