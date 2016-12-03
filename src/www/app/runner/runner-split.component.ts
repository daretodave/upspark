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
    @ViewChild('runnerArgument') runnerArgument: ElementRef;

    @Output() onCommand:EventEmitter<string>  = new EventEmitter<string>();
    @Input() argument: string;
    @Output() argumentChange: EventEmitter<string> = new EventEmitter<string>();
    @Input() command: string;
    @Output() commandChange: EventEmitter<string> = new EventEmitter<string>();
    @Input() output: string;

    constructor() {
    }

    onKeyDown(arg:KeyboardEvent):boolean {
        if(arg.key === ':') {
            arg.preventDefault();
            arg.stopPropagation();
            arg.stopImmediatePropagation();

            this.runnerArgument.nativeElement.focus();
            return false;
        }
        return true;
    }

    onEnter(command:string, argument:string) {
        if(!command) {
            this.ngAfterViewInit();
            return;
        }

        this.onCommand.emit(`${command}:${argument}`);
    }

    onArgumentChange(update:string) {
        this.argumentChange.emit(update);
    }

    onCommandChange(update:string) {
        this.commandChange.emit(update);
    }

}