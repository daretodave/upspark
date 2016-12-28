import {CommandIntent} from "./command-intent";
import {CommandLogEntry} from "./command-log-entry";
export interface CommandLike {

    id?: string,
    intent?: CommandIntent;
    canceled?: boolean;
    response?: string;
    tag?: string;
    output?: string;
    error?: boolean;
    completed?: boolean;
    update?: number;
    init?: number;
    progress?: number;
    log?: CommandLogEntry[];

}
