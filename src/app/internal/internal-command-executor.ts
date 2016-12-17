import {Resource} from "../system/resource/resource";
import {Safe} from "../system/safe";
import {Command} from "../../www/app/runner/command/command";
import {Reload} from "./commands/reload";
import {CommandStateChange} from "../api/platform/command-state-change";
import {Logger} from "../system/logger/logger";
import {InternalCommand} from "./internal-command";
import {InternalCommandHooks} from "./internal-command-hooks";
export class InternalCommandExecutor {

    private commands: Map<string, {new (...args:any[]):InternalCommand }> = new Map<string, {new (...args:any[]):InternalCommand }>();

    constructor(public hooks:InternalCommandHooks) {
        this.commands.set('RELOAD', Reload);
    }

    static publishUpdate(runner:{sender:any, command:Command, title:string, host?:InternalCommandExecutor}, updates:any, completed:boolean = false):Command {
        updates.update = Date.now();

        if(completed) {
            updates.progress = 100;
            updates.completed = true;

            if(updates.output) {
                let log:string = `:command '${runner.title}'`;
                let output:string = updates.output;
                if (output.length > 50) {
                    log = `\n${output}`;
                } else {
                    log = ` = ${output}`;
                }

                Logger.info(`:command '${runner.title}'${log}`);
            }
        }

        runner.sender.send('command-state-change', new CommandStateChange(runner.command, updates));

        if(updates.error) {
            Logger.error(`${runner.host ? `:command '${runner.title}' | ` : ''}${updates.error}`);
        }

        return runner.command;
    }


    execute(sender:any, command: Command):Promise<any> {
        let title:string = command.argument;
        let args:string[] = title.split("|");

        if (args.length > 1) {
            title = args.splice(0, 1)[0];
        } else {
            args = [];
        }
        title = title.trim().toUpperCase();

        let constructor:{new (...args:any[]):InternalCommand } = this.commands.get(title);
        if (!constructor) {
            let error:string = `The internal command <strong>${title}</strong> could not be found`;

            InternalCommandExecutor.publishUpdate({sender, command, title}, {error}, true);
            return Promise.reject(error);
        }

        Logger.info(`:command '${title}' | executing`);
        if(args.length) {
            Logger.info(`:command '${title}' | ${args.join(",")}`);
        }

        let runner:InternalCommand = new constructor();

        runner.title = title;
        runner.args = args;
        runner.command = command;
        runner.sender = sender;
        runner.host = this;

        return runner
            .execute()
            .then((output:string) => {
                InternalCommandExecutor.publishUpdate(runner, {output}, true)
            })
            .catch((error:any) => {
                error = error || 'There was an issue during execution.';
                if(error.hasOwnProperty('message')) {
                    error = error.message;
                }

                InternalCommandExecutor.publishUpdate(runner, {error}, true);
            })
    }
}