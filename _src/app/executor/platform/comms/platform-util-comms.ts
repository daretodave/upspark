import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
import {PlatformBootstrapper} from "../platform-bootstrapper";
import {Platform} from "../platform";
import {Logger} from "../../../model/logger/logger";
import {CommandRuntime} from "../../../model/command/command-runtime";
export class PlatformUtilComms extends PlatformCommsHandler {

    static ALL = 0;
    static SCRIPTS = 1;
    static SETTINGS = 2;
    static THEME = 3;

    init() {
        this.add('reload', PlatformUtilComms.reload, {
            'mode': `Platform.ALL<br>Platform.SCRIPTS<br>Platform.SETTINGS<br>Platform.THEME`
        });
        this.add('getPath', PlatformUtilComms.getPath);
        this.add('getPlatformCommands', PlatformUtilComms.getPlatformCommands);
        this.add('getInternalCommands', PlatformUtilComms.getInternalCommands);
        this.add('getCommands', PlatformUtilComms.getCommands);
    }

    static getCommands(host:Host) {
        return [
            ...PlatformUtilComms.getInternalCommands(host).map(command => `${CommandRuntime.FLAG_INTERNAL}${command}`),
            ...PlatformUtilComms.getPlatformCommands(host).map(command => `${CommandRuntime.FLAG_PLATFORM}${command}`)
        ]
    }

    static getPlatformCommands(host: Host) {
        return Object.keys(host.platform().getCommands());
    }

    static getInternalCommands(host: Host) {
        return host.getInternalCommands();
    }

    static getPath(host: Host) {
        return host.resources().root;
    }

    static reload(host: Host,
                  mode: any,
                  resolve: (message?: any) => any,
                  reject: (message?: string, syntax?: boolean) => any) {
        mode = parseInt(mode);

        if (mode !== PlatformUtilComms.ALL
            && mode !== PlatformUtilComms.SCRIPTS
            && mode !== PlatformUtilComms.SETTINGS
            && mode !== PlatformUtilComms.THEME) {

            if(mode === '' || typeof mode === undefined) {
                reject(`A reload option must be provided`, true);
                return;
            }

            reject(`'${mode}' is not a valid reload task`, true);
            return;
        }

        Logger.info('RELOADING', mode);

        let promises: Promise<any>[] = [];

        if(mode === PlatformUtilComms.SCRIPTS || mode === PlatformUtilComms.ALL) {
            promises.push(PlatformBootstrapper
                .load(host.resources(), null)
                .then((platform: Platform) => {
                    host.platform(platform);
                    return true;
                })
            );
        }
        if (mode === PlatformUtilComms.ALL) {
            promises.push(host.reload());
        } else if (mode === PlatformUtilComms.SETTINGS) {
            promises.push(host.reloadSettings());
        } else if (mode === PlatformUtilComms.THEME) {
            promises.push(host.reloadTheme());
        }

        Promise
            .all(promises)
            .then(() => resolve(''))
            .catch((error:any) => reject(error));
    }

    constructor(host: Host) {
        super(host, 'Platform');
    }

}