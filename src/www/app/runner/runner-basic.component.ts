import {Component, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input} from "@angular/core";

require('./runner-basic.component.scss');

@Component({
    selector: 'up-runner-basic',
    templateUrl: 'runner-basic.component.html',
})
export class RunnerBasicComponent implements AfterViewInit {

    onInputChange(update:string) {
        this.inputChange.emit(update);
    }

    @ViewChild('runnerInput') runnerInput: ElementRef;
    @Output() onCommand:EventEmitter<string> = new EventEmitter<string>();

    @Input() input: string;
    @Input() loading: boolean;
    @Output() inputChange: EventEmitter<string> = new EventEmitter<string>();

    ngAfterViewInit() {
        this.runnerInput.nativeElement.focus();
    }

    onEnter(value:string) {
        if(!value.trim().length) {
            return;
        }

        this.onCommand.emit(value);
    }

    constructor() {
    }

}