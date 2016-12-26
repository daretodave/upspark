import {Reload} from "./commands/reload";
import {Logger} from "../system/logger/logger";
import {InternalCommand} from "./internal-command";
import {InternalCommandHooks} from "./internal-command-hooks";
import {CommandUpdateCommunicator} from "../model/command/command-update/command-update-emitter";
import {CommandIntent} from "../model/command/command-intent";
export class InternalCommandExecutor {

    private commands = new Map<string, (communicator:CommandUpdateCommunicator) => InternalCommand>();

    constructor(public hooks: InternalCommandHooks) {
        this.commands.set(
            'RELOAD',
            communicator => new Reload(communicator)
        );
    }


    execute(intent:CommandIntent, communicator:CommandUpdateCommunicator) {

        let constructor = this.commands.get(communicator.intent.command);

        if (!constructor) {
            communicator.error(
                `The internal command <strong>${options.intent.command}</strong> could not be found`,
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