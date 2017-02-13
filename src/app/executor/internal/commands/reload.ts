import {InternalCommand} from "../internal-command";
import {PlatformBootstrapper} from "../../platform/platform-bootstrapper";
import {Platform} from "../../platform/platform";
import {Logger} from "../../../model/logger/logger";

declare type ReloadAction = [string, (command:Reload) => any];

const actions = new Map([

    ["ALL",      (command) => command
        .reloadAll()
    ] as ReloadAction,

    ["COMMANDS", (command) => command
        .reloadCommands()
        .then (command.resolve)
        .catch(command.reject)
    ] as ReloadAction,

    ["SETTINGS", (command) => command
        .reloadSettings()
        .then (command.resolve)
        .catch(command.reject)
    ] as ReloadAction,

    ["THEME", (command) => command
        .reloadTheme()
        .then (command.resolve)
        .catch(command.reject)
    ] as ReloadAction

]);

const parameters:string =
    Array
    .from(actions)
    .map((action, index) => action[0])
    .sort()
    .reduce((left:string, right:string):string => {
        return left + `\n\t\t\t<li>${right}</li>`;
    }, '');

export class Reload extends InternalCommand {

    reloadAll() {
        Promise.all([
            this.reloadCommands(),
            this.reloadSettings(),
            this.reloadTheme()
        ]).then(message => this.resolve(message)).catch(this.reject);
    }

    reloadCommands(): Promise<string> {
        return PlatformBootstrapper.load(this.task.host.resources(), this.task)
        .then((platform: Platform) => {
            this.task.host.platform(platform);

            let count:number = platform.size();

            return `RELOADED ${count} COMMAND${count === 0 || count !== 1 ? 'S' : ''}`;
        });
    }

    reloadSettings(): Promise<string> {
        return this.task.host.reloadSettings()
            .then(() => {
                return `RELOADED SETTINGS`;
            });
    }

    reloadTheme(): Promise<string> {
        return this.task.host.reloadTheme()
            .then(() => {
                return `RELOADED THEME`;
            });
    }

    onExecute(arg: string = 'ALL') {

        const tag: string = arg.toUpperCase().trim();
        if (!actions.has(tag)) {
            this.reject(
                `<strong>${tag}</strong> is not a valid argument for a reload task. <br><br>\n\n` +
                `\t\tAvailable arguments are &hyphen;<ul>${parameters}</blockquote></ul>\n`
            );
            return;
        }

        Logger.info(`reloading ${tag}`);

        this.task.update({tag});

        actions.get(tag)(this);
    }

}