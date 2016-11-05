import {ResourceModel} from "./resource/resource-model";
export class Settings implements ResourceModel {

    private width:number;
    private height:number;

    constructor() {
    }

    toDefaultState() {
        this.width = 100;
        this.height = 30;
    }

}