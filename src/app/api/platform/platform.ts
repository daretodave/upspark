import {Util} from "../util";
import * as _ from 'lodash';
const util = require('util');
const tryRequire = require('try-require');
const apiModules:any = {
  safe: require('raw!../modules/safe.js')
};
const excludes:string[] = require('builtin-modules');
const _process = process;

export {excludes, apiModules};

export class Platform {

    process:any;

    constructor(public reference:any) {
        this.process = _process;
    }

    public getMessage():string {
        let commands:any[] = [];
        let message:string[] = [];
        let sandbox:any = this["upspark"];

        for(let command in sandbox.commands) {

            if(!sandbox.commands.hasOwnProperty(command)) {
                continue;
            }

            let mapping:any = sandbox.commands[command];
            let resolve:any = {};

            resolve.context = mapping.context;
            resolve.command = command;

            if(!Util.isFunction(mapping.processor)) {
                resolve.message = ` = '${mapping.processor}'`;
            } else {
                resolve.message = `(${Util.getArgumentNames(mapping.processor).join(', ')})`;
            }

            commands.push(resolve);
        }

        commands = _.sortBy(commands, ['context', 'command']);

        message.push("commands");

        commands.forEach((command:any) => message.push(`@[${command.context}]\t\t${command.command}${command.message}`));

        return message.join("\n");
    }

    public require: (path:string) => void = Platform.include.bind(this);

    private static include(path:string) {
        if(!excludes.includes(path)) {
            throw `Could not find module ${path}`;
        }
        return tryRequire(path);
    }


}