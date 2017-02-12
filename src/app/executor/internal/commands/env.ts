import {InternalCommand} from "../internal-command";
import {inspect} from "util";
import ErrnoException = NodeJS.ErrnoException;
import {Logger} from "../../../model/logger/logger";

declare type EnvAction = [string, {errorMessage: string, argCount: number, callback: (env: Env, key: string, value: string) => string}];

const actions = new Map([
    ["SET", {
        errorMessage: '<i>key</i> <i>value</i>',
        argCount: 2,
        callback: (env: Env, key: string, value: string) => env.setENV(key, value)
    }
    ] as EnvAction,
    ["DELETE", {
        errorMessage: '<i>key</i>',
        argCount: 1,
        callback: (env: Env, key: string, value: string) => env.deleteENV(key)
    }
    ] as EnvAction,
]);

const parameters: string =
    Array
        .from(actions)
        .map((action, index) => action[0])
        .sort()
        .reduce((left: string, right: any): string => {
            return left + `\n\t\t\t<li>${right} | <span class="accent">:env ${right.toLowerCase()} ${actions.get(right).errorMessage}</span></li>`;
        }, '');

export class Env extends InternalCommand {

    onExecute(mode: string, key: string, value: string): string {
        if (!arguments.length) {
            if (!Object.keys(this.task.host.getENV()).length) {
                return `No temporary environment variables have been set.<br><br>
                        Add variables with -- <br><br>\t\t&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span class="accent">:</span>env set <strong>key</strong> <strong class="accent">value</strong><br><br>Environment variables attached to the process\n\n
                        <br><br>${inspect(process.env, {showHidden:true, depth:null})}`.replace(/,/g, ',<br>');
            }

            return `Temporary environment variables\n\n<br><br>${inspect(this.task.host.getENV(), true, 5)}
            <br><br>Environment variables attached to the process. These will be replaced by replaced by variables above with the same key\n\n
            <br><br>${inspect(process.env, {showHidden:true, depth:null})}`.replace(/,/g, ',<br>');
        }

        const tag: string = mode.toUpperCase().trim();
        if (!actions.has(tag)) {
            this.reject(
                `<strong>${tag}</strong> is not a valid argument for the env task. <br><br>\n\n` +
                `\t\tAvailable options are &hyphen;<ul>${parameters}</blockquote></ul>\n`
            );
            return;
        }

        let action: any = actions.get(tag);
        if ((action.argCount + 1) > arguments.length) {
            let missingArgs: number = (action.argCount + 1) - arguments.length;

            this.reject(`<strong>${tag}</strong> needs ${(missingArgs === 1 ? 'atleast one more argument' : `${missingArgs} more arguments`)}
                        <br><br>\t\t&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="accent">:env ${tag.toLowerCase()} ${action.errorMessage}</span>`);
            return;
        }

        Logger.info(`env cmd ${action} | key = ${key} | value = ${value}`);

        return action.callback(this, key, value);
    }

    deleteENV(key: string): string {
        if (!this.task.host.getENV().hasOwnProperty(key)) {
            this.reject(`No variable with the name '${key}' was found`);

            return;
        }

        delete this.task.host.getENV()[key];

        return `Deleted the variable <span class="accent">${key}</span>`
    }

    setENV(key: string, value: string): string {
        this.task.host.getENV()[key] = value;

        return `Set the variable <span class="accent">${key}</span> to <span class="accent">${value}</span>`
    }

}