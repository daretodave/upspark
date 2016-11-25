import {ResourceModel} from "../resource/resource-model";
import {LogMessage} from "./log-message";
export class Log implements ResourceModel {

    public error:LogMessage;
    public messages:LogMessage[] = [];

    toDefaultState(): void {
    }

    public isLoggableError() {
        return this.error != null && 5 >= Math.abs((this.error.date.getTime() - new Date().getTime()) / 60000);
    }

}