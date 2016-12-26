import {CommandIntent} from "../command-intent";
import {CommandUpdate} from "./command-update";
export interface CommandUpdateMessage {
    update: CommandUpdate,
    intent: CommandIntent
}