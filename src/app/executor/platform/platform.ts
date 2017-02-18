import * as _ from 'lodash';
import Process = NodeJS.Process;
import {Logger} from "../../model/logger/logger";
import {Util} from "../../util/util";
const util = require('util');
const tryRequire = require('try-require');

const excludes:string[] = require('builtin-modules');
const apiComms:string = require('raw!./modules/comms.js');
const apiModules:any = {
    safe: require('raw!./modules/safe.js')
};

export {excludes, apiModules, apiComms};

export class Platform {

    private commands:any;

    constructor(public process:Process) {
    }

    public size():number {
        return Object.keys(this.commands).length;
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
            resolve.reference = title;

            if(mapping.split) {
                resolve.reference += `[${mapping.split}]`;
            }

            if(!Util.isFunction(mapping.processor)) {
                resolve.message = ` = '${mapping.processor}'`;
            } else {
                resolve.message = `(${Util.getArgumentNames(mapping.processor).join(', ')})`;
            }

            commands.push(resolve);
        }
        message.push("mappings");

        commands = _.sortBy(commands, ['context', 'command']);
        commands.forEach((command:any) => message.push(`@[${command.context}]\t\t${command.reference}${command.message}`));

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