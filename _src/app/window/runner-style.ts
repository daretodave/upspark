import {ResourceModel} from "../model/resource/resource-model";
export class RunnerStyle implements ResourceModel {

    content:string;

    toDefaultState(): void {
        this.content = '';
    }

}