import {Component, Input, EventEmitter, HostListener, ElementRef, OnInit, Output} from "@angular/core";

require("./slider.component.scss");

@Component({
    selector: 'up-slider',
    templateUrl: 'slider.component.html',
})
export class SliderComponent implements OnInit {

    private dragging:boolean;
    private bounds:ClientRect;
    private size:number;
    private offset:number;
    private left:number;
    private top:number;
    private position:number;
    @Output() onPositionChange:EventEmitter<number>;
    @Output() onPositionFinalChange:EventEmitter<number>;

    @Input('value') value: number;
    @Input('vertical') vertical: boolean;
    @Input('upper') upper: number = 1;
    @Input('lower') lower: number = 0;

    @HostListener('document:mouseup')
    private onDocumentMouseUp() {
        if(!this.dragging) {
            return;
        }
        this.dragging = false;
        this.onPositionFinalChange.emit(this.value);
    }
    @HostListener('document:mousemove', ['$event'])
    private onDocumentMouseMove(event:MouseEvent) {
        if(!this.dragging) {
          return;
        }
        let offset = this.vertical ? this.bounds.top : this.bounds.left;
        let location = this.vertical ? event.y : event.x;

        offset += this.offset;

        let position:number = Math.max(0, Math.min(1, (location-offset) / this.size));
        let value:number = (position * (this.upper - this.lower)) + this.lower;

        this.setValue(value);

        this.onPositionChange.emit(value);
    }

    ngOnInit() {
       this.setValue(this.value);
    }

    public setValue(value:number) {
        this.position = (value - this.lower) / (this.upper - this.lower);
        this.value = value;

        this.updateIndicatorLocation(this.position);
    }

    private updateIndicatorLocation(position:number) {
        position = position * 100;

        this.top = this.vertical ? position : 0;
        this.left = this.vertical ? 0 : position;
    }

    constructor(private el: ElementRef) {
        this.onPositionChange = new EventEmitter<number>();
        this.onPositionFinalChange = new EventEmitter<number>();
    }

    onBallInteraction(event:MouseEvent) {
        this.dragging = true;

        this.bounds = this.el.nativeElement.getBoundingClientRect();
        this.size = this.vertical ? this.bounds.height : this.bounds.width;

        let bounds:ClientRect = event.srcElement.getBoundingClientRect();

        this.offset = this.vertical ? bounds.height/2 : bounds.width/2;
    }

}