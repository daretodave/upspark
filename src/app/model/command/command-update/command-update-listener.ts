import {CommandUpdateEvent} from "./command-update-event";

export interface CommandUpdateListener {

    onUpdate(update: CommandUpdateEvent): any;

}