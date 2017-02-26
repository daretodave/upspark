import {CommandIntent} from "./command-intent";
import {CommandLogEntry} from "./command-log-entry";
import {CommandLike} from "./command-like";
import {CommandRuntime} from "./command-runtime";

export class Command implements CommandLike {

    static STORAGE_KEY:string = 'commands';
    static STORAGE_LIMIT:number = 200;

    constructor(public id: string,
                public intent: CommandIntent,
                public tag: string = '',
                public response: string = '',
                public output: CommandLogEntry[] = [],
                public error: boolean = false,
                public canceled: boolean = false,
                public completed: boolean = false,
                public update: number = Date.now(),
                public init: number = Date.now(),
                public progress: number = -1,
                public log: CommandLogEntry[] = [],
                public type: CommandRuntime = CommandRuntime.PLATFORM) {
    }

}
