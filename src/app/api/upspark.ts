import {Command} from "./command";
import {Platform} from "./platform/platform";
export class Upspark {

    public context:string;
    public commands: Map<any, Command> = new Map<string, Command>();

    constructor(private platform:Platform) {
    }

    public on(directive:any, executor:any) {
        this.commands.set(directive, new Command(this.context || null, executor, this.platform));
    }

    public get(directive:any): any {
        return this.commands.get(directive).executor;
    }

    public run(directive:any, ...args:any[]) {
        if(!directive) {
            throw `the command argument provided was empty`;
        }
        if(!this.commands.has(directive)) {
            throw `command '${directive}' not found`;
        }
        let command: Command = this.commands.get(directive);

        return command.executor.apply(this, args);
    }

}