import {CommandTask} from "../model/command/command-task";
import {spawnSync} from 'child_process';
import {EnvMap} from "../model/env-map";
import {Logger} from "../model/logger/logger";
export interface Executor {

    execute(task: CommandTask): any;

    cancel(task: CommandTask, id: string): any;

    message(task: CommandTask, id: string, message: string): any;

}

export namespace Executor {

    const PLATFORMS_KNOWN_TO_WORK = new Set([
        'darwin',
        'linux'
    ]);

    const ENVIRONMENT_VARIABLES_TO_PRESERVE = new Set([
        'NODE_ENV',
        'NODE_PATH'
    ]);

    export const getProperENV = () => { //thanks github

        Logger.info('Updating process ENV');

        let envToAssign;

        if (!shouldGetEnvFromShell(process.env)) {
            Logger.info('No need to update process ENV, maybe WIN32?', process.platform);
            return;
        }

        envToAssign = getEnvFromShell(process.env);

        if (envToAssign) {
            for (let key in process.env) {
                if (!ENVIRONMENT_VARIABLES_TO_PRESERVE.has(key)) {
                    Logger.info(`Removing ENV '${key}' | ${process.env[key]}`);

                    delete process.env[key];
                }
            }

            for (let key in envToAssign) {
                if (!ENVIRONMENT_VARIABLES_TO_PRESERVE.has(key) || (!process.env[key] && envToAssign[key])) {

                    Logger.info(`Setting ENV '${key}' | ${process.env[key]}`);

                    process.env[key] = envToAssign[key];
                }
            }

        }
    }

    function shouldGetEnvFromShell(env: EnvMap) {
        if (!PLATFORMS_KNOWN_TO_WORK.has(process.platform)) {
            return false
        }

        if (!env || !env['SHELL'] || env['SHELL'].trim() === '') {
            return false
        }

        return true
    }

    const getEnvFromShell = (env: EnvMap) => {

        let {stdout} = spawnSync(env['SHELL'], ['-ilc', 'command env'], {encoding: 'utf8'});
        if (stdout) {
            let result = {}
            for (let line of stdout.split('\n')) {
                if (line.includes('=')) {
                    let components = line.split('=')
                    let key = components.shift()
                    let value = components.join('=')
                    result[key] = value
                }
            }
            return result
        }
    }

}