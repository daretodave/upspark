import {Component, Input, Output, EventEmitter, ElementRef, Renderer, OnInit, HostListener} from "@angular/core";

@Component({
    selector: 'up-slider-ball',
    templateUrl: 'slider-ball.component.html',
})
export class SliderBallComponent {

    @Input() vertical: boolean;
    @Input() dragging: boolean;
    @Input() top: number;
    @Input() left: number;

    @Output() onMouseDownEvent:EventEmitter<Event>;

    @HostListener('mousedown', ['$event'])
    onMouseDownEventListener(event:Event) {
        this.onMouseDownEvent.emit(event);
        return false;
    }

    constructor(private el: ElementRef, private renderer: Renderer) {
        this.onMouseDownEvent = new EventEmitter<Event>()
    }

}