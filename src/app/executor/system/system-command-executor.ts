import {CommandTask} from "../../model/command/command-task";
import {ChildProcess, spawn, exec, execFile} from "child_process";
import {Logger} from "../../model/logger/logger";
import {CommandRuntime} from "../../model/command/command-runtime";
export class SystemCommandExecutor {

    private pool = new Map<string, ChildProcess>();

    constructor(public runtime:CommandRuntime) {
    }

    public execute(task:CommandTask) {
        Logger.info(`>command ${task.digest.command.display}`);

        let process: ChildProcess;

        switch(this.runtime) {
            case CommandRuntime.SYSTEM:
                process = spawn(
                    task.digest.command.content,
                    task.digest.argument, {
                        cwd: task.host.cwd()
                    }
                );
                break;
            case CommandRuntime.BASH:
                process = execFile(
                    task.digest.command.content,
                    task.digest.argument, {
                        cwd: task.host.cwd()
                    }
                );
                break;
            case CommandRuntime.BASH_EXTERNAL:
                process = exec(
                    [task.digest.command.content].concat(task.digest.argument).join(" "),{
                        cwd: task.host.cwd()
                    }
                );
                break;
        }


        this.pool.set(task.id,process);

        process.on('close', (code: number) => {
            Logger.info(`>command '${task.digest.command.display}' process has finished [] > exit code = ${code}`);

            task.update({tag: `(${code})`});

            if(!task.isCompleted()) {
                task.complete();
            }

            this.pool.delete(task.id);
        });

        process.stdout.on('data', (message:any) => task.out(message));
        process.stderr.on('data', (message:any) => task.out(message, true));

        process.on('error', (message:any) => {
            if(message.code === 'ENOENT') {
                message = `Could not find '${task.digest.command.content}'`;
            }

            task.error(message)
        });
    }

}