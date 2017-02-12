import {CommandTask} from "../../model/command/command-task";
import {ChildProcess, spawn, execFile} from "child_process";
import {Logger} from "../../model/logger/logger";
import {CommandRuntime} from "../../model/command/command-runtime";
import {Executor} from "../executor";
import {inspect} from "util";
import ReadableStream = NodeJS.ReadableStream;
import {Socket} from "net";
import ErrnoException = NodeJS.ErrnoException;
import {EOL} from "os";
export class SystemCommandExecutor implements Executor {


    cancel(id: string) {
        let process:ChildProcess = this.pool.get(id);
        if (process === null) {
            Logger.info(`>process ${id} not found to cancel`);
            return;
        }

        try {
            process.kill();
        } catch(error) {
            Logger.error(error);
        }
    }

    message(task:CommandTask, id: string, message:string) {
        let childProcess:ChildProcess = this.pool.get(id);

        if (childProcess === null) {
            Logger.info(`>process ${id} not found to send message`);
            return;
        }

        try {

            task.out(`<div class="block"><span class="accent">&rightarrow;</span>&nbsp;&nbsp;${message}</div>`);

            childProcess.stdin.write(message+ EOL);

        } catch(error) {
            Logger.error(error);
        }
    }

    private pool = new Map<string, ChildProcess>();

    constructor(public runtime:CommandRuntime) {
    }

    public execute(task:CommandTask) {
        Logger.info(`>command ${task.digest.command.display}`);

        let childProcess: ChildProcess;

        switch(this.runtime) {
            case CommandRuntime.SYSTEM:
                childProcess = spawn(
                    task.digest.command.content,
                    task.digest.argument, {
                        cwd: task.host.cwd(),
                        env: process.env,
                        shell: true
                    }
                );
                break;
            case CommandRuntime.BASH_EXTERNAL:
                childProcess = execFile(
                    task.digest.command.content,
                    task.digest.argument, {
                        cwd: task.host.cwd(),
                        env: process.env
                    }
                );
                break;
            case CommandRuntime.BASH:

                let options = {};
                options['cwd'] = task.host.cwd();
                options['windowsVerbatimArguments'] = true;
                options['shell'] = true;

                if(task.digest.command.content === "node" || task.digest.command.content === "python") {
                    task.digest.argument.unshift("-i");
                }

                childProcess = spawn(
                    task.digest.command.content,
                    task.digest.argument,
                    options
                );

                (<Socket>childProcess.stdout).setEncoding('utf8');
                (<Socket>childProcess.stdin).setEncoding('utf8');
                (<Socket>childProcess.stderr).setEncoding('utf8');

                break;
        }


        this.pool.set(task.id,childProcess);

        childProcess.on('close', (code: number) => {
            Logger.info(`>command '${task.digest.command.display}' process has finished [] > exit code = ${code}`);

            task.update({tag: `(${code})`});

            if(!task.isCompleted()) {
                task.complete();
            }

            this.pool.delete(task.id);
        });

        childProcess.stdout.on('data', (message:any) => {
            if(task.digest.command.content === "node") {
                let blocks:string[] = message.split(/(?:\r\n|\r|\n)/);

                message = blocks.filter(block => block.trim() !== ">").join('\n');
            }

            Logger.info(`>command ${task.digest.command.display} broadcasted through stdout | id = ${task.id}`);
            Logger.info(message);

            task.out(message, false, true);
        });
        childProcess.stderr.on('data', (message:any) => {
            if(task.digest.command.content === "node") {
                let blocks:string[] = message.split(/(?:\r\n|\r|\n)/);

                message = blocks.filter(block => block.trim() !== ">").join('\n');
            }

            Logger.error(`>command ${task.digest.command.display} broadcasted through stderror | id = ${task.id}`);
            Logger.error(message);


            task.out(message, true, true);
        });

        childProcess.on('error', (message:any) => {
            if(message.code === 'ENOENT') {
                message = `Could not find '${task.digest.command.content}'`;
            }

            Logger.error(`>command ${task.digest.command.display} threw an error | id = ${task.id}`);
            Logger.error(message);

            task.error(message)
        });
    }

}