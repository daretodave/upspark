import {ChildProcess} from "child_process";
import {Command} from "../../model/command/command";
import {CommandUpdate} from "../../model/command/command-update";
import {Logger} from "../../system/logger/logger";
const {fork} = require('child_process');

export class PlatformExecutor {

    private pool:Map<string, ChildProcess>;

    constructor(private platform:string) {
        this.pool = new Map<string, any>();
    }

    public execute(command:Command, update:(change:CommandUpdate) => any) {
        const process = fork(this.platform, [command.title].concat(command.argument));

        process.on('close', (code:number) => {
            this.pool.delete(command.id);

            update(new CommandUpdate(command, {
                completed: true
            }));
            if(!command.completed) {
                Logger.info(`#command '${command.title}' process has finished [] > exit code = ${code}`);
                command.completed = true;
            }
        });
        process.on('message', (message:any) => {
            if(!message.type) {
                return;
            }

            if (message.type === 'command-result') {
                let separation:string = message.response.length > 50 ? '\n' : ' = ';

                Logger.info(`#command '${command.title}'${separation}${message.response}`);

                update(new CommandUpdate(command, {
                    error: message.error ? message.response : '',
                    output: message.response,
                    completed: true
                }));

                command.completed = true;

            } else if(message.type === 'command-log') {
                let separation:string = message.message.length > 50 ? '\n' : ' | ';
                Logger[message.error ? "error" : "info"](`#command '${command.title}'${separation}${message.message}`)

                if(!message.internal) {
                    let state: CommandUpdate = new CommandUpdate(command);
                    state.modify(message.logType, message.message);
                    update(state);
                }
            }
        });
        process.on('uncaughtException', (err:any) => {
            update(new CommandUpdate(command, {
                error: err
            }));
        });

        this.pool.set(command.id, process);
    }

}