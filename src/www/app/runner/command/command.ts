import {CommandLog} from "./command-log";
export class Command {

    constructor(public id:string, public title:string, public argument:string) {
        this.log = [];
        this.progress = -1;
        this.init = this.update = Date.now();
        this.error = '';
        this.output = '';
        this.completed = false;
        this.lastInteraction = -1;
        this.stale = false;
    }

    progress:number;
    log:CommandLog[];
    init:number;
    error:string;
    output:string;
    completed:boolean;
    update:number;

    lastInteraction:number;
    hover: boolean;
    stale:boolean;

}