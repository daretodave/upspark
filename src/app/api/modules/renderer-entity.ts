export class RendererEntity {

    private onAction:any;
    private nodes:any[];
    private widthWeight:number;
    private heightWeight:number;
    private alignContentVertical:boolean;

    constructor() {
        this.nodes = [];
    }
    children():any[] {
        return this.nodes;
    }
    append(child:any): RendererEntity {
        this.nodes.push(child);
        return this;
    }
    action(action?:any):(any|RendererEntity) {
        if(action != null) {
            this.onAction = action;
            return this;
        }
        return this.onAction;
    }
    height(height?:number):(number|RendererEntity) {
        if(height != null) {
            this.heightWeight = height;
            return this;
        }
        return this.heightWeight;
    }
    width(width?:number):(number|RendererEntity) {
        if(width != null) {
            this.widthWeight = width;
            return this;
        }
        return this.widthWeight;
    }

    isVertical():boolean {
        return this.alignContentVertical;
    }

    isHorizontal():boolean {
        return !this.alignContentVertical;
    }

    vertical():RendererEntity {
        this.alignContentVertical = true;
        return this;
    }

    horizontal():RendererEntity {
        this.alignContentVertical = false;
        return this;
    }

}