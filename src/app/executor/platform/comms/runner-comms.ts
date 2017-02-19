import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
import {Command} from "../../../model/command/command";
import {inspect} from "util";
import {CommandTask} from "../../../model/command/command-task";
import {CommandIntent} from "../../../model/command/command-intent";
import {CommandUpdate} from "../../../model/command/command-update/command-update";
import {CommandIntentDigest} from "../../../model/command/command-intent-digest";
import {CommandArgument} from "../../../model/command/command-argument";

const generatedUUID = require('uuid/v1');

export class RunnerComms extends PlatformCommsHandler {

    constructor(host:Host) {
        super(host, 'Runner');
    }

    init() {
        this.add('getTasks', RunnerComms.getTasks);
        this.add('abort', RunnerComms.abort);
        this.add('run', RunnerComms.run, {
            command: 'The targeted command\'s title',
            '...args': 'Arguments to pass to the command'
        });
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