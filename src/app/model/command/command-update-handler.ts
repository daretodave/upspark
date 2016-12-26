import {CommandUpdateMessage} from "./command-update-message";

export interface CommandUpdateHandler {

    onCommandUpdate(message: CommandUpdateMessage): any;

}