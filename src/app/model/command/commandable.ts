import {CommandIntent} from "./command-intent";
import {CommandLogEntry} from "./command-log-entry";
export interface Commandable {

    id?: string,
    intent?: CommandIntent;
    canceled?: boolean;
    response?: string;
    output?: string;
    error?: boolean;
    completed?: boolean;
    update?: number;
    init?: number;
    progress?: number;
    log: CommandLogEntry[];

}
