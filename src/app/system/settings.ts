import {ResourceModel} from "./resource/resource-model";
import {Location} from "../model/location";
import {Size} from "../model/size";
export class Settings implements ResourceModel {

    public location:Location;
    public size:Size;
    public hotkey:string;

    constructor() {
    }

    toDefaultState() {

        this.location = new Location();
        this.location.screen = 0;
        this.location.offsetX = 0;
        this.location.offsetY = .5;
        this.location.x = 0;
        this.location.y = 0;

        this.size = new Size();
        this.size.width = 1;
        this.size.height = .33;

        this.hotkey = 'Control+`';

    }

}