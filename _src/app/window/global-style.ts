import {ResourceModel} from "../model/resource/resource-model";
export class GlobalStyle implements ResourceModel {

    content:string;

    toDefaultState(): void {
        this.content = '';
    }

}