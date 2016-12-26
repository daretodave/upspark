import {CommandIntent} from "../command-intent";
import {CommandUpdate} from "./command-update";
export interface CommandUpdateEvent {
    update: CommandUpdate,
    intent: CommandIntent
}