import {Reload} from "./commands/reload";
import {InternalCommand} from "./internal-command";
import {CommandTask} from "../../model/command/command-task";
import {Logger} from "../../model/logger/logger";
import {CommandArgument} from "../../model/command/command-argument";
import {Cd} from "./commands/cd";
import {Path} from "./commands/path";
import {Ls} from "./commands/ls";
import {Open} from "./commands/open";
import {Executor} from "../executor";
import {Env} from "./commands/env";
export class InternalCommandExecutor implements Executor {

    private commands = new Map<string, { new(...args: any[]): InternalCommand }>();

    cancel(id: string) {

    }

    message(task:CommandTask, id: string, message:string) {

    }
    
    constructor() {
        this.commands.set('reload', Reload);
        this.commands.set('cd', Cd);
        this.commands.set('env', Env);
        this.commands.set('path', Path);
        this.commands.set('open', Open);
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