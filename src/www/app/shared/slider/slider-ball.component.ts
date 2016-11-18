import {Component, Input, Output, EventEmitter, ElementRef, Renderer, OnInit, HostListener} from "@angular/core";

@Component({
    selector: 'up-slider-ball',
    templateUrl: 'slider-ball.component.html',
})
export class SliderBallComponent implements OnInit {


    @Input() vertical: boolean;
    @Input() position: number;
    @Input() dragging: boolean;

    @Output() onMouseDownEvent:EventEmitter<Event>;

    @HostListener('mousedown', ['$event'])
    onMouseDownEventListener(event:Event) {
        this.onMouseDownEvent.emit(event);
        return false;
    }

    constructor(private el: ElementRef, private renderer: Renderer) {
        this.onMouseDownEvent = new EventEmitter<Event>()
    }

    update() {
        let position = Math.max(0, Math.min(1, this.position)) * 100;

        this.renderer.setElementStyle(this.el.nativeElement, this.vertical ? 'top' : 'left', `${position}%`);
    }

    ngOnInit() {
        this.update();
    }

}