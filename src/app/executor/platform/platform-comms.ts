import {PlatformCommsHandler} from "./platform-comms-handler";
import {Host} from "../../model/host";
import {SafeComms} from "./comms/safe-comms";
import {ChildProcess} from "child_process";
import {PlatformMessage} from "./platform-message";
import {Logger} from "../../model/logger/logger";

export class PlatformComms {

    private handlers: Map<string, PlatformCommsHandler>;

    constructor(host: Host) {
        this.handlers = new Map<string, PlatformCommsHandler>();

        this.handlers.set("SAFE", new SafeComms(host));
    }

    handle(message: string, parameters?: any): Promise<string> {
        return new Promise(
            (resolve: (message?: string) => any,
             reject: (message?: string) => any) => {

                if (!message) {
                    reject(`Action not provided`);
                    return;
                }

                let blocks = message.split(".").map(block => block.toUpperCase());

                if (blocks.length < 2) {
                    reject(`Action not provided in message, ${message}`);
                    return;
                }

                let processor: string = blocks[0];
                let action: string = blocks[1];

                if (!this.handlers.has(processor)) {
                    reject(`Processor '${processor}' does not exists`);
                    return;
                }

                this.handlers.get(processor).handle(
                    action,
                    parameters,
                    resolve,
                    reject
                );

            });
    }

    onProcessMessage(childProcess: ChildProcess, message: PlatformMessage) {
        const id:string = message.payload["id"];

        Logger.info(`COMMS request for ${message.payload["action"]}`);

        this.handle(
            message.payload["action"],
            message.payload["parameters"]
        ).then((result: String) => {
            Logger.info(`COMMS result for ${message.payload["action"]}`);

            childProcess.send({
                id:id,
                message:{
                    payload: result,
                    error: false
                }
            });

        }).catch((reason: string) => {
            Logger.error(id, 'COMMS error', reason);

            childProcess.send({
                id:id,
                message:{
                    payload: reason,
                    error: true
                }
            });

        });
    }

}