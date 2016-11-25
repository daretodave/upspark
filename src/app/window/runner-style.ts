import {ResourceModel} from "../system/resource/resource-model";
export class RunnerStyle implements ResourceModel {

    content:string;

    toDefaultState(): void {
        this.content = '';
    }

}