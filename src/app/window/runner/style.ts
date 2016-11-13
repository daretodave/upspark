import {ResourceModel} from "../../system/resource/resource-model";
export class Style implements ResourceModel {

    content:string;

    toDefaultState(): void {
        this.content = require('./style.css');
    }

}