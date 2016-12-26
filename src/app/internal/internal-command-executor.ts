import {Reload} from "./commands/reload";
import {Logger} from "../system/logger/logger";
import {InternalCommand} from "./internal-command";
import {InternalCommandHooks} from "./internal-command-hooks";
import {CommandUpdateEmitter} from "../model/command/command-update/command-update-emitter";
import {CommandIntent} from "../model/command/command-intent";
import {CommandTask} from "../model/command/command-task";
import {Command} from "../model/command/command";
export class InternalCommandExecutor {

    private commands = new Map<string, (communicator: CommandUpdateEmitter) => InternalCommand>();

    constructor(public hooks: InternalCommandHooks) {
        this.commands.set(
            Command.getNormalizedName('RELOAD'),
            communicator => new Reload(communicator)
        );
    }


    execute(task: CommandTask) {

        let command: string = task.command.intent.command.trim().substring(1).trim();
        let commandName:string = Command.getNormalizedName(command);
        let constructor = this.commands.get(Command.getNormalizedName(command));

        if (!constructor) {
            task.error(
                `The internal command <strong>${command}</strong> could not be found`,
                true
            );
            return;
        }

        Logger.info(`:command '${title}' | executing`);
        if (argument.length) {
            Logger.info(`:command '${title}' | ${argument.join(",")}`);
        }

        let runner: InternalCommand = new constructor();

        runner.title = title;
        runner.args = argument;
        runner.command = command;
        runner.sender = sender;
        runner.host = this;

        return runner
            .execute()
            .then((output: string) => {
                InternalCommandExecutor.publishUpdate(runner, {output}, true)
            })
            .catch((error: any) => {
                error = error || 'There was an issue during execution.';
                if (error.hasOwnProperty('message')) {
                    error = error.message;
                }

                InternalCommandExecutor.publishUpdate(runner, {error}, true);
            })
    }
}