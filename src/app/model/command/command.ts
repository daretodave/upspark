import {CommandIntent} from "./command-intent";
import {CommandLogEntry} from "./command-log-entry";
import {CommandLike} from "./command-like";
export class Command implements CommandLike {

    constructor(public id: string,
                public intent: CommandIntent,
                public tag: string = '',
                public response: string = '',
                public output: string = '',
                public error: boolean = false,
                public canceled: boolean = false,
                public completed: boolean = false,
                public update: number = Date.now(),
                public init: number = Date.now(),
                public progress: number = -1,
                public log: CommandLogEntry[] = []) {
    }

}
