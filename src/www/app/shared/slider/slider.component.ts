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
    private dirty:boolean;
    private offset:number;
    private left:number;
    private top:number;
    @Output() onPositionChange:EventEmitter<number>;
    @Output() onPositionFinalChange:EventEmitter<number>;

    @Input('position') position: number;
    @Input('vertical') vertical: boolean;

    @HostListener('document:mouseup')
    private onDocumentMouseUp() {
        if(!this.dragging) {
            return;
        }
        this.dragging = false;
        if(!this.dirty) {
            return;
        }
        this.dirty = false;

        this.onPositionFinalChange.emit(this.position);
    }
    @HostListener('document:mousemove', ['$event'])
    private onDocumentMouseMove(event:MouseEvent) {
        if(!this.dragging) {
          return;
        }
        let offset = this.vertical ? this.bounds.top : this.bounds.left;
        let location = this.vertical ? event.y : event.x;

        offset += this.offset;

        this.position = Math.max(0, Math.min(1, (location-offset) / this.size));

        this.setBallLocation(this.position, true);
    }

    ngOnInit() {
        this.setBallLocation(this.position);
    }

    private setBallLocation(position:number, isPostInit:boolean = false) {
        position = position * 100;

        this.top = this.vertical ? position : 0;
        this.left = this.vertical ? 0 : position;
        if(isPostInit) {
            this.dirty = true;
            this.onPositionChange.emit(this.position);
        }
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