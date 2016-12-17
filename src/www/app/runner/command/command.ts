import {CommandLog} from "./command-log";
export class Command {

    constructor(public id:string, public originalInput:string, title:string, argument:string) {
        this.title = title ? title.trim() : '';
        this.argument = argument;
        this.isSystemCommand = argument.trim().length && !title.length;
        this.log = [];
        this.progress = -1;
        this.init = this.update = Date.now();
        this.error = '';
        this.output = '';
        this.completed = false;
        this.lastInteraction = -1;
        this.siblings = 0;
        this.stale = false;
        this.isNavigatedTo = false;
    }

    argument:string;
    title:string;
    progress:number;
    log:CommandLog[];
    init:number;
    error:string;
    output:string;
    completed:boolean;
    isSystemCommand:boolean;
    update:number;

    lastInteraction:number;
    hover: boolean;
    stale:boolean;
    siblings: number;
    isNavigatedTo: boolean;

}