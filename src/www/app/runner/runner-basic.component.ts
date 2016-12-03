import {Component, OnInit, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';

require('./runner-basic.component.scss');

@Component({
    selector: 'up-runner-basic',
    templateUrl: 'runner-basic.component.html',
})
export class RunnerBasicComponent implements AfterViewInit {

    @ViewChild('runnerInput') input: ElementRef;
    @Output() onCommand:EventEmitter<string>;

    ngAfterViewInit() {
        this.input.nativeElement.focus();
    }

    onEnter(value:string) {
        this.onCommand.emit(value);
    }

    constructor() {
    }

}