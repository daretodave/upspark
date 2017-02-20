import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
import {Command} from "../../../model/command/command";
import {inspect} from "util";
import {CommandTask} from "../../../model/command/command-task";
import {CommandIntent} from "../../../model/command/command-intent";
import {CommandUpdate} from "../../../model/command/command-update/command-update";
import {CommandIntentDigest} from "../../../model/command/command-intent-digest";
import {CommandArgument} from "../../../model/command/command-argument";
import {merge} from 'lodash';

const generatedUUID = require('uuid/v1');

export class RunnerComms extends PlatformCommsHandler {

    constructor(host:Host) {
        super(host, 'Runner');
    }

    init() {
        this.add('getTasks', RunnerComms.getTasks);
        this.add('getCWD', RunnerComms.getCWD);
        this.add('getENV', RunnerComms.getENV);
        this.add('abort', RunnerComms.abort);
        this.add('isVisible', RunnerComms.isVisible);
        this.add('show', RunnerComms.show);
        this.add('setENV', RunnerComms.setENV, {
            key: 'The environment variable\'s key',
            value: 'The environment variable\'s value',
        });
        this.add('hide', RunnerComms.hide);
        this.add('setCWD', RunnerComms.setCWD, {
            cwd: 'The directory to execute tasks in',
        });
        this.add('run', RunnerComms.run, {
            command: 'The targeted command\'s title',
            '...args': 'Arguments to pass to the command'
        });
    }


    static setENV(host:Host,
                  env: any,
                  resolve: (message?: any) => any,
                  reject: (message?: string, syntax?:boolean) => any) {

        if(!env.key) {
            reject(`Provide the environment variable's key.`, true);
            return;
        }
        if(typeof env.value === 'undefined') {
            reject(`Provide the value for the '${env.key}' environment variable.`, true);
            return;
        }

        host.setENV(env.key, env.value);

        resolve(true);
    }

    static setCWD(host:Host,
                  cwd:string,
                  resolve: (message?: any) => any,
                  reject: (message?: string, syntax?:boolean) => any) {

        if(!cwd) {
            reject(`Provide the directory to use as the CWD.`, true);
            return;
        }

        host.cwd(cwd);

        resolve(true);

    }

    static getCWD(host:Host) {
        return host.cwd();
    }

    static getENV(host:Host,
                  key:string) {
        if(!key) {
            return merge({}, process.env, host.getENV());
        }

        if(host.getENV().hasOwnProperty(key)) {
            return host.getENV()[key];
        }

        if(process.env.hasOwnProperty(key)) {
            return process.env[key];
        }

        return '';
    }

    static isVisible(host:Host) {
        return host.isRunnerWindowVisible()
    }

    static toggle(host:Host) {
        host.toggleRunnerWindow();
        return true;
    }

    static show(host:Host) {
        host.showRunnerWindow();
        return true;
    }

    static hide(host:Host) {
        host.hideRunnerWindow();
        return true;
    }

    static run(host:Host,
                    args:any,
                    resolve: (message?: any) => any,
                    reject: (message?: string, syntax?:boolean) => any) {

        if(!args.command) {
            reject(`Provide the command to run.`, true);
            return;
        }

        let intent:CommandIntent = new CommandIntent();

        intent.command = args.command;
        intent.arguments = args.args.map((arg:any) => {
           let commandArgument:CommandArgument = new CommandArgument();
           commandArgument.content = arg;
           return commandArgument;
        });

        let command:Command = new Command(
            generatedUUID(),
            intent
        );

        let task:CommandTask = new CommandTask(command, host, {

            onCommandUpdate(update:CommandUpdate) {
                if(!update.completed) {
                    return;
                }
                if(update.error) {
                    reject(update.message);
                } else {
                    resolve(update.message);
                }
            }

        });

        host.execute(task);
    }

    static abort(host:Host,
                 id:string) {

        if(!id) {
            host.sendRunnerMessage('end-tasks');
        } else {
            host.sendRunnerMessage('end-task', id);
        }

        return true;
    }

    static getTasks(host:Host, filter:any,
                    resolve: (message?: any) => any,
                    reject: (message?: string, syntax?:boolean) => any) {

        host.sendRunnerRequest('get-tasks')
            .then((commands:Command[]) => {

                if(filter && filter.id) {
                    resolve(commands.find(command => command.id === filter.id));
                    return;
                }

                if(filter && filter.running) {
                    commands = commands.filter(command => !command.completed);
                }

                resolve(commands);
            })
            .catch((error:any) => reject(inspect(error, true, null)));

    }

}