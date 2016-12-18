import {Command} from "../../www/app/runner/command/command";
import {InternalCommandExecutor} from "./internal-command-executor";
import {ProgressEventHandler} from "../model/progress-event-handler";
import {ProgressEvent} from "../model/progress-event";
export abstract class InternalCommand implements ProgressEventHandler {

    protected resolve: (value?: string | PromiseLike<string>) => void;
    protected reject: (reason?: string) => void;

    public sender:any;
    public command:Command;
    public title:string;
    public args:string[];

    public host:InternalCommandExecutor;

    public onProgressUpdate(event: ProgressEvent) {
        this.broadcast(ProgressEvent.asChangeset(event));
    }

    public broadcast(updates:any, completed:boolean = false) {
        InternalCommandExecutor.publishUpdate(this, updates, completed);
    }

    public send(message:string, ...args:any[]) {
        return this.sender.send.apply(this.sender, [message].concat(args));
    }

    public execute(): Promise<string> {
        let self: InternalCommand = this;

        let executor = (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: string) => void) => {
            this.resolve = resolve;
            this.reject  = reject;

            try {
                let response:any = self.onExecute.apply(self, self.args);
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