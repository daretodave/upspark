import {InternalCommand} from "../internal-command";
import {Logger} from "../../../model/logger/logger";
import ErrnoException = NodeJS.ErrnoException;

export class Settings extends InternalCommand {

    onExecute(): any {

        Logger.info(`opening settings and hiding runner`);

        this.task.host.openSettingsWindow();

        return 'Settings launched';
    }

}