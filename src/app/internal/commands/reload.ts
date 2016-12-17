import {InternalCommand} from "../internal-command";
import {PlatformBootstrapper} from "../../api/platform/platform-bootstrapper";
import {Platform} from "../../api/platform/platform";
import {Logger} from "../../system/logger/logger";
import reject = require("lodash/reject");

const types:string[] = [
    "all",
    "safe",
    "settings",
    "commands"
];

export class Reload extends InternalCommand {

    onExecute(arg:string = 'COMMANDS') {
        const type:string = arg.toUpperCase();

        if(type === 'COMMANDS') {
            Logger.info('reloading commands');

            new PlatformBootstrapper(this.host.hooks.getResources())
                .load()
                .then((platform:Platform) => {
                    this.host.hooks.onPlatformUpdate(platform)
                    this.resolve(`Commands reloaded`);
                })
                .catch(this.reject);
        } else {

        }

    }

}