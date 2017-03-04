import {Command} from "../../../../app/model/command/command";
import {CommandIntent} from "../../../../app/model/command/command-intent";
export class CommandWrapper {

    public reference:Command;

    constructor(
        id:string,
        intent:CommandIntent,

        public update:number = -1,
        public hover:boolean = false,
        public stale:boolean = false,
        public active:boolean = false,
        public historical:boolean = false,
        public repl:boolean = false
    ) {
        this.reference = new Command(id, intent);
    }

    public isIdle():boolean {
        return this.stale  || this.active || !this.reference.completed;
    }

    get error():boolean {
        return !this.historical && this.reference.completed && this.reference.error;
    }

    get loading():boolean {
        return !this.historical && !this.reference.completed && this.reference.progress < 0;
    }

    get completed():boolean {
        return !this.historical && this.reference.completed && !this.reference.error;
    }

}