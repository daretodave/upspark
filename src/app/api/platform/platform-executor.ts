import {ChildProcess} from "child_process";
import {Command} from "../../../www/app/runner/command/command";
import {CommandStateChange} from "./command-state-change";
import {Logger} from "../../system/logger/logger";
const {fork} = require('child_process');

export class PlatformExecutor {

    private pool:Map<string, ChildProcess>;

    constructor(private platform:string) {
        this.pool = new Map<string, any>();
    }

    public execute(command:Command, update:(change:CommandStateChange) => any) {
        const process = fork(this.platform, [command.title, command.argument]);

        process.on('close', (code:number) => {
            Logger.info(`#command-finish [${command.title}] > exit code = ${code}`);

            update(new CommandStateChange(command, {
                completed: true
            }));
        });
        process.on('message', (message:any) => {
            if(!message.type) {
                return;
            }

            if (message.type === 'command-result') {
                let separation:string = message.response.length > 50 ? '\n' : ' = ';
                Logger.info(`#command-result [${command.title}]${separation}${message.response}`);

                update(new CommandStateChange(command, {
                    error: message.error ? message.response : '',
                    output: message.response,
                }));

            } else if(message.type === 'command-log') {
                let separation:string = message.message.length > 50 ? '\n' : ' = ';
                Logger.append(message.error, `#command-message [${command.title}]${separation}${message.message}`);

                if(!message.internal) {
                    let state: CommandStateChange = new CommandStateChange(command);
                    state.modify(message.logType, message.message);
                    update(state);
                }
            }
        });
        process.on('uncaughtException', (err:any) => {
            update(new CommandStateChange(command, {
                error: err
            }));
        });

        this.pool.set(command.id, process);
    }

}