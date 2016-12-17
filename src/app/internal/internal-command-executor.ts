import {Resource} from "../system/resource/resource";
import {Safe} from "../system/safe";
import {Command} from "../../www/app/runner/command/command";
import {Reload} from "./commands/reload";
import {CommandStateChange} from "../api/platform/command-state-change";
import {Logger} from "../system/logger/logger";
import {InternalCommand} from "./internal-command";
export class InternalCommandExecutor {

    private commands: Map<string, {new (...args:any[]):InternalCommand }> = new Map<string, {new (...args:any[]):InternalCommand }>();

    constructor(public safe: Safe, public resources: Resource) {

        this.commands.set('RELOAD', Reload);
    }

    static publishUpdate(sender:any, arg:Command, updates:any, completed:boolean = false) {
        updates.update = Date.now();

        if(completed) {
            updates.progress = 100;
            updates.completed = true;
        }

        sender.send('command-state-change', new CommandStateChange(arg, updates));

        if(updates.error) {
            Logger.error(updates.error);
        }
    }


    execute(sender:any, arg: Command):Promise<any> {
        let title:string = arg.argument;
        let args:string[] = title.split("|");

        Logger.info(`internal command | ${title}`);

        if (args.length > 1) {
            title = args.splice(1)[0];
        }

        title = title.trim().toUpperCase();

        let constructor:{new (...args:any[]):InternalCommand } = this.commands.get(title);
        if (!constructor) {
            let error:string = `The system command <strong>${title}</strong> could not be found`;

            InternalCommandExecutor.publishUpdate(sender, arg, {error}, true);
            return Promise.reject(error);
        }

        let runner:InternalCommand = new constructor();

        runner.command = arg;
        runner.sender = sender;
        runner.host = this;

        return runner.execute();
    }
}