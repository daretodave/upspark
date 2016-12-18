export interface ProgressEvent {
    message?:string;
    log?:string[];
    error?:boolean;
    progress?:number;
    completed?:boolean;
}
export namespace ProgressEvent {
    export function asChangeset(event:ProgressEvent):any {
        let changeset:any = {};

        if(event.completed !== undefined) {
            changeset.completed = event.completed;
        }
        if(event.progress !== undefined) {
            changeset.progress = event.progress;
        }
        if(event.error !== undefined) {
            changeset.error = event.error;
        }
        if(event.message) {
            changeset[`log-${event.error ? 'error' : 'info'}`] = event.message;
        }
        if(event.log) {
            changeset.log = event.log;
        }

        return changeset;
    }
}