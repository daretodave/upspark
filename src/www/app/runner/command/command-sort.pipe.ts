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
        array = array.filter((command:Command) => !command.stale || command.isNavigatedTo);
        array = _.sortBy(array, property || 'update').reverse();
        array = array.map((command:Command) => {
            command.siblings = Math.max(command.siblings, array.length);
            return command;
        });

        return array;
    }
}