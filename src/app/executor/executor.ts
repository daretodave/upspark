import {CommandTask} from "../model/command/command-task";
export interface Executor {
    
    execute(task:CommandTask):any;
    
}