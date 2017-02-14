import {CommandTask} from "../model/command/command-task";
export interface Executor {
    
    execute(task:CommandTask):any;

    cancel(task:CommandTask, id:string):any;

    message(task:CommandTask, id:string, message:string): any;

}