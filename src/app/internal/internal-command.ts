import {Command} from "../../www/app/runner/command/command";
import {InternalCommandExecutor} from "./internal-command-executor";
export abstract class InternalCommand {

    protected __resolve: (value?: string | PromiseLike<string>) => void;
    protected __reject: (reason?: string) => void;

    public sender:any;
    public command:Command;

    public host:InternalCommandExecutor;

    public broadcast(updates:any, completed:boolean) {
        InternalCommandExecutor.publishUpdate(this.sender, this.command, updates, completed)
    }

    public resolve(output:string) {
        this.broadcast({output}, true);

        this.resolve(output);
    }

    public reject(error:string) {
        this.broadcast({error}, true);

        this.__reject(error);
    }

    public execute(): Promise<string> {
        let self: InternalCommand = this;
        let args:string[] = this.command.argument.split("|");
        if(args.length > 0) {
            args.splice(1);
        }

        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: string) => void) => {
            self.__resolve = resolve;
            self.__resolve = reject;
            self.onExecute.apply(self, args);

            self.onExecute()
        };

        return new Promise<string>(executor);
    }

    abstract onExecute(...args: string[]): any

}