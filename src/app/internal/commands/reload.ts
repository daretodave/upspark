import {InternalCommand} from "../internal-command";
import {PlatformBootstrapper} from "../../api/platform/platform-bootstrapper";
import {Platform} from "../../api/platform/platform";
import {Logger} from "../../system/logger/logger";
import reject = require("lodash/reject");

declare type ReloadAction = [string, (command:Reload) => any];

const actions = new Map([
    ["ALL",      (command) => command.reloadAll()]      as ReloadAction,
    ["COMMANDS", (command) => command.reloadCommands()] as ReloadAction
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

    constructor() {
        super();
    }

    reloadAll() {
        this.reloadCommands();
    }

    reloadCommands() {
        new PlatformBootstrapper(this.host.hooks.getResources())
            .load(this)
            .then((platform: Platform) => {
                this.host.hooks.onPlatformUpdate(platform);
                this.resolve(`SUCCESS`);
            })
            .catch(this.reject);
    }

    onExecute(arg: string = 'COMMANDS') {

        const tag: string = arg.toUpperCase().trim();
        if (!actions.has(tag)) {
            this.reject(
                `<strong>${tag}</strong> is not a valid argument for a reload task. <br><br>\n\n` +
                `\t\tAvailable arguments are &hyphen;<ul>${parameters}</blockquote></ul>\n`
            );
            return;
        }

        Logger.info(`reloading ${tag}`);

        this.broadcast({tag});

        actions.get(tag)(this);
    }

}