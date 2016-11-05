import {ResourceModel} from "./resource/resource-model";
import {Resource} from "./resource/resource";
export class Settings implements ResourceModel<Settings> {

    private width:number;
    private height:number;

    toDefaultState() {
        this.width = 100;
        this.height = 30;
    }

}