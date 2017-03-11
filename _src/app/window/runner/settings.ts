import {ResourceModel} from "../../model/resource/resource-model";
import {Location} from "../../model/location";
import {Size} from "../../model/size";
import {UpTheme} from "../../model/up-theme";
export class Settings implements ResourceModel {

    public location:Location;
    public size:Size;
    public hotkey:string;
    public rotation:number;
    public theme:UpTheme;
    public alwaysOnTop:boolean;

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
        this.size.height = .5;

        this.theme = new UpTheme();
        this.theme.global = '';
        this.theme.runner = '';

        this.alwaysOnTop = false;

        this.rotation = 0;

        this.hotkey = 'CommandOrControl+`';

    }

}