import {ResourceModel} from "../system/resource/resource-model";
export class GlobalStyle implements ResourceModel {

    content:string;

    toDefaultState(): void {
        this.content = '';
    }

}