import {Pipe} from "@angular/core";
import {CommandWrapper} from "./command-wrapper";
import {filter, sortBy} from "lodash";

@Pipe({
    name: "commandSort",
    pure: false
})
export class CommandSortPipe {
    transform(array: Array<CommandWrapper>): Array<CommandWrapper> {

        array = filter(
            array,
            (wrapper:CommandWrapper) => !wrapper.stale || wrapper.active
        );

        array = sortBy(
            array,
            (wrapper:CommandWrapper) => wrapper.reference.update * -1
        );

        return array;
    }
}