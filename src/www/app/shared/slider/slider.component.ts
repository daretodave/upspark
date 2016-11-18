import {Component, Input, EventEmitter, HostListener} from "@angular/core";

require("./slider.component.scss");

@Component({
    selector: 'up-slider',
    templateUrl: 'slider.component.html',
})
export class SliderComponent {

    private dragging:boolean;

    @Input('position') position: string;
    @Input('vertical') vertical: boolean;

    @HostListener('document:mouseup')
    private onDocumentMouseUp() {
        this.dragging = false;
    }
    @HostListener('document:mousemove', ['$event'])
    private onDocumentMouseMove(event:Event) {
        if(this.dragging) {
            console.log('dragging');
        }
    }

    constructor() {
    }

    onBallInteraction(event:Event) {
        this.dragging = true;
    }

}