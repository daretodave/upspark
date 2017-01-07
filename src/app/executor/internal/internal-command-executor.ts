import {Reload} from "./commands/reload";
import {InternalCommand} from "./internal-command";
import {CommandTask} from "../../model/command/command-task";
import {Logger} from "../../model/logger/logger";
import {CommandArgument} from "../../model/command/command-argument";
export class InternalCommandExecutor {

    private commands = new Map<string, { new(...args: any[]): InternalCommand }>();
    
    constructor() {
        this.commands.set('reload', Reload);
    }

    execute(task: CommandTask) {

        let constructor = this.commands.get(task.digest.command.normalized);

        if (!constructor) {
            task.error(
                `The internal command <strong>${task.digest.command.display}</strong> could not be found`
            );
            return;
        }

        Logger.info(`:command '${task.digest.command.display}' | executing`);
        if (task.command.intent.arguments.length) {
            Logger.info(`:command '${task.digest.command.display}' | ${task.command.intent.arguments.map((arg:CommandArgument) => arg.content).join(",")}`);
        }

        let runner: InternalCommand = new constructor();

        runner.task = task;

        return runner.execute().then((message:string) => task.complete(message)).catch((error:any) => task.error(error));
    }
}