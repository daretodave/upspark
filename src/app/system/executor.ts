import {ExecutorEvent} from "./executor-event";
import {ChildProcess} from "child_process";
const {fork} = require('child_process');
const Guid = require('guid');

export class Executor {

    private pool:Map<string, ChildProcess>;

    constructor(private platform:string) {
        this.pool = new Map<string, any>();
    }

    public execute(input:string):string {
        const guid:string = Guid.raw();
        const process = fork(this.platform, [input]);

        process.on('close', (code:number) => {
           console.log(code);
        });

        process.on('message', (message:any) => {
            console.log(message);
        });

        this.pool.set(guid, process);
        // thread
        //     .send(input)
        //     .on('message', (message:any) => {
        //         onEvent(!message.error ? ExecutorEvent.RESPONSE : ExecutorEvent.ERROR, message.response);
        //     })
        //     .on('error', (error:any) => {
        //         onEvent(ExecutorEvent.ERROR, error);
        //     })
        //     .on('exit', () => onEvent(ExecutorEvent.CANCEL, null));

        return guid;
    }

}