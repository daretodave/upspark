import {CommandUpdate} from "./command-update";

export interface CommandUpdateListener {

    onCommandUpdate(update:CommandUpdate):any;

}