import {Command} from "../../www/app/runner/command/command";
import {Resource} from "../system/resource/resource";
import {Safe} from "../system/safe";
export abstract class InternalCommand {

    public resolve: (value?: string | PromiseLike<string>) => void;
    public reject: (reason?: string) => void;

    public broadcast() {
    }

    constructor(public sender:any, public command: Command, public resources:Resource, public safe:Safe) {
    }

    public execute(): Promise<string> {
        let self: InternalCommand = this;
        let args:string[] = this.command.argument.split("|");
        if(args.length > 0) {
            args.splice(1);
        }

        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: string) => void) => {
            self.resolve = resolve;
            self.reject = reject;
            self.onExecute.apply(self, args);

            self.onExecute()
        };
        return new Promise<string>(executor);
    }

    abstract onExecute(...args: string[]): any

}