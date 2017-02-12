import {CommandTask} from "../model/command/command-task";
export interface Executor {
    
    execute(task:CommandTask):any;

    cancel(id:string):any;

    message(task:CommandTask, id:string, message:string): any;

}