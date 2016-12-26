import {CommandUpdate} from "../../model/command/command-update/command-update";
import {Logger} from "../../system/logger/logger";
import {ChildProcess, fork} from "child_process";
import {PlatformExecutorTask} from "./platform-executor-task";
import {CommandArgument} from "../../model/command/command-argument";
import {Command} from "../../model/command/command";
import {PlatformMessage} from "./platform-message";
import {inspect} from "util";

export class PlatformExecutor {

    constructor(private workerScriptLocation: string,
                private pool = new Map<string, ChildProcess>()) {
    }

    public execute({id, intent, update, error, complete, platform, isCompleted}:PlatformExecutorTask) {
        Logger.info(`#command '${intent ? intent.command : 'UNDEFINED'}'`);

        let commandTitle: string;
        if (!intent
            || !intent.command
            || (commandTitle = intent.command.trim()).length === 0) {

            error('No command provided', true);
            return;
        }

        commandTitle = Command.getNormalizedName(commandTitle);
        if (!platform.hasCommandMapped(commandTitle)) {
            error(`The command <strong>${intent.command}</strong> could not be found`, true);
            return;
        }

        let {pool, workerScriptLocation} = this;
        let process: ChildProcess;

        pool.set(
            id,
            process =
                fork(workerScriptLocation,
                    [commandTitle].concat(
                        intent.arguments.map(
                            (argument: CommandArgument) => argument.title
                        )
                    )
                )
        );

        process.on('close', (code: number) => {
            Logger.info(`#command '${commandTitle}' process has finished [] > exit code = ${code}`);

            if (!isCompleted()) {
                complete();
            }
        });

        process.on('message', (message: PlatformMessage) => {

            let log = (error: boolean, message: any) => {
                if (typeof message === 'string' && message.length < 50) {
                    Logger.log(error, `\t\t# ${message}`);
                } else if (Array.isArray(message)) {
                    Logger.log.apply(Logger, [error].concat(message));
                } else {
                    Logger.log(message);
                }
            };

            Logger.info(`#command '${commandTitle}' | process = '${process.pid}' | ${message["intent"]}`);

            message = PlatformMessage.sanitize(message);

            let commandUpdate: CommandUpdate = new CommandUpdate(id);

            switch (message.intent) {

                case PlatformMessage.INTENT_ABORT:
                case PlatformMessage.INTENT_FATAL_ERROR:
                    let context: string =
                        message.intent === PlatformMessage.INTENT_FATAL_ERROR
                            ? 'Suffered a fatal error'
                            : 'Task made process abort request';

                    if (message.payload) {
                        Logger.error(message.payload);
                    }

                    log(true, `${context}, killing child process | task.id = ${id}`);

                    try {
                        process.kill();
                    } catch (error) {
                        Logger.error(error);

                        log(true, `Failed to end the child process, ${error.message}`);
                    }


                    commandUpdate.progress = 100;
                    commandUpdate.canceled = true;
                    commandUpdate.completed = true;
                    commandUpdate.output = CommandUpdate.getSanitizedMessage(message.payload, true);

                    break;
                case PlatformMessage.INTENT_PROGRESS:

                    if (message.payload.hasOwnProperty("progress")) {
                        commandUpdate.progress = parseInt(message.payload['progress'], 10);
                    } else {
                        commandUpdate.progress = parseInt(message.payload, 10);
                    }

                    if (message.payload.hasOwnProperty("message")) {
                        let logIsError: boolean = message.payload["error"] === true;
                        let logMessage: string = CommandUpdate.getSanitizedMessage(message.payload['message'], logIsError);

                        log(logIsError, logMessage);

                        commandUpdate[logIsError ? "errors" : "messages"].push(logMessage);
                        commandUpdate.error = logIsError;

                    } else {
                        log(false, `progress update | ${commandUpdate.progress}`);
                    }

                    break;
                case PlatformMessage.INTENT_RESULT:
                    let output: string = null;

                    if (typeof message.payload === 'string') {
                        output = message.payload;
                    } else if (typeof message === 'object') {
                        commandUpdate.absorb(message.payload);

                        output = commandUpdate.response;
                    }

                    if (!output) {
                        if (commandUpdate.response === null) {
                            commandUpdate.response = CommandUpdate.DEFAULT_SUCCESS_MESSAGE;
                        }
                        output = commandUpdate.response;
                    } else {
                        commandUpdate.output = output;
                    }

                    let separation: string = output.length > 50 ? '\n' : ' = ';

                    Logger.log(
                        !!commandUpdate.error,
                        `#command '${commandTitle}'${separation}${output}`
                    );

                    commandUpdate.progress = 100;
                    commandUpdate.completed = true;
                    break;

                case PlatformMessage.INTENT_UPDATE:
                    log(message.payload["error"] === true, `update | ${inspect(message.payload)}`)

                    commandUpdate.absorb(message.payload);
                    break;

                default:
                    let isError: boolean = message.intent === PlatformMessage.INTENT_LOG_ERROR;

                    log(isError, message.payload);

                    commandUpdate[isError ? "errors" : "messages"].push(
                        CommandUpdate.getSanitizedMessage(
                            message.payload,
                            isError
                        )
                    );
                    break;
            }

            update(commandUpdate);
        });

        process.on('uncaughtException', (err: any) => error(err));
    }

}