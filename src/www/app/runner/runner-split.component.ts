import {Component, AfterViewInit, EventEmitter, Output, Input, ViewChild, ElementRef} from '@angular/core';

require('./runner-split.component.scss');

@Component({
    selector: 'up-runner-split',
    templateUrl: 'runner-split.component.html',
})
export class RunnerSplitComponent implements AfterViewInit {

    ngAfterViewInit() {
        this.runnerInput.nativeElement.focus();
    }

    @ViewChild('runnerInput') runnerInput: ElementRef;
    @Output() onCommand:EventEmitter<string>;
    @Input() input: string;
    @Output() inputChange: EventEmitter<string> = new EventEmitter<string>();

    @Input() output: string;
    @Output() outputChange: EventEmitter<string> = new EventEmitter<string>();

    constructor() {
    }

    onEnter(value:string) {
        this.onCommand.emit(value);
    }

    onInputChange(update:string) {
        this.inputChange.emit(update);
    }

    onOutputChange(update:string) {
        this.outputChange.emit(update);
    }

}