import {ProgressEvent} from "./progress-event";
export interface ProgressEventHandler {

    onProgressUpdate(event: ProgressEvent): any;

}

export namespace ProgressEventHandler {

    export const BLANK: ProgressEventHandler = {onProgressUpdate: () => null};

}