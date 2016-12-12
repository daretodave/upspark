import {Pipe} from "@angular/core";
import {Command} from "./command";
import {CommandLog} from "./command-log";

const _ = require('lodash');

@Pipe({
    name: "commandSort",
    pure: false
})
export class CommandSortPipe {
    transform(array: Array<Command>, property?: string): Array<Command> {
        array = array.filter((command:Command) => !command.stale);

        if(property === 'log') {
            array.sort((a: Command, b: Command) => {
                const logsA: number[] = _.sortBy(<CommandLog[]>a.log, ['time']).map((entry: CommandLog) => entry.time);
                const logsB: number[] = _.sortBy(<CommandLog[]>b.log, ['time']).map((entry: CommandLog) => entry.time);

                return (logsA.pop() || 0) - (logsB.pop() || 0);
            });
            return array;
        }

        return _.sortBy(array, property || 'update').reverse();
    }
}