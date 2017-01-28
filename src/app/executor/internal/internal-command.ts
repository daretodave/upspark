
import {CommandTask} from "../../model/command/command-task";
import {CommandArgument} from "../../model/command/command-argument";
export abstract class InternalCommand {

    public resolve: (value?: any | PromiseLike<any>) => void;
    public reject: (reason?: any) => void;
    public task:CommandTask;

    public execute(): Promise<string> {
        let self: InternalCommand = this;

        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: string) => void) => {
            this.resolve = resolve;
            this.reject  = reject;

            try {
                let response:any = self.onExecute.apply(
                    self,
                    self.task.digest.argument
                );

                if (response !== undefined && Promise.resolve(response) !== response) {
                    resolve(response);
                }

            } catch(err) {
                this.reject(err);
            }
        };

        return new Promise<string>(executor);
    }

    abstract onExecute(...args: string[]): any

}