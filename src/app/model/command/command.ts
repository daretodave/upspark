import {CommandIntent} from "./command-intent";
import {CommandLogEntry} from "./command-log-entry";
export class Command {

    constructor(
        public id:number,
        public intent:CommandIntent,
        public response:string = '',
        public output:string = '',
        public error:boolean = false,
        public completed:boolean = false,
        public update:number = Date.now(),
        public init:number = Date.now(),
        public progress:number = -1,
        public log:CommandLogEntry[] = []
    ) {

    }

}