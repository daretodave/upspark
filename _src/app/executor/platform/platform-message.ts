import {CommandUpdate} from "../../model/command/command-update/command-update";
type PlatformMessageIntent = "result" | "error" | "log-error" | "log-internal" | "log-internal-error" | "update" | "progress" | "abort" | "log" | "out" | "out-error" | "comms";

export interface PlatformMessage {

    intent: string;
    payload?: any;
}

export namespace  PlatformMessage {

    export const INTENT_RESULT: PlatformMessageIntent = "result";
    export const INTENT_COMMS: PlatformMessageIntent = "comms";
    export const INTENT_UPDATE: PlatformMessageIntent = "update";
    export const INTENT_INTERNAL_LOG: PlatformMessageIntent = "log-internal";
    export const INTENT_INTERNAL_LOG_ERROR: PlatformMessageIntent = "log-internal-error";
    export const INTENT_FATAL_ERROR: PlatformMessageIntent = "error";
    export const INTENT_PROGRESS: PlatformMessageIntent = "progress";
    export const INTENT_ABORT: PlatformMessageIntent = "abort";
    export const INTENT_LOG: PlatformMessageIntent = "log";
    export const INTENT_OUT_ERROR: PlatformMessageIntent = "out-error";
    export const INTENT_OUT: PlatformMessageIntent = "out";
    export const INTENT_LOG_ERROR: PlatformMessageIntent = "log-error";

    export const sanitize = (message: PlatformMessage) => {

        if (typeof message === 'undefined') {
            message = {
                intent: PlatformMessage.INTENT_OUT,
                payload: ''
            }
        } else if (typeof message === 'string' || Array.isArray(message)) {
            message = {
                intent: PlatformMessage.INTENT_OUT,
                payload: message
            }
        } else if (typeof message === "number") {
            message = {
                intent: PlatformMessage.INTENT_PROGRESS,
                payload: message
            }
        }
        message.intent = message.intent || PlatformMessage.INTENT_LOG;

        if (!message.hasOwnProperty('payload')) {
            switch (message.intent) {
                case PlatformMessage.INTENT_LOG_ERROR:
                    message.payload = CommandUpdate.DEFAULT_ERROR_MESSAGE;
                    break;
                case PlatformMessage.INTENT_FATAL_ERROR:
                    message.payload = CommandUpdate.DEFAULT_FATAL_ERROR_MESSAGE;
                    break;
                case PlatformMessage.INTENT_ABORT:
                    message.payload = CommandUpdate.DEFAULT_ABORT_MESSAGE;
                    break;
                case PlatformMessage.INTENT_PROGRESS:
                    message.payload = -1;
                    break;
                default:
                    message.payload = '';
                    break;
            }
        }


        return message;
    }
}
