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
    @Input() loading: boolean;

    constructor() {
    }

    onInputKeyUp(arg:KeyboardEvent) {
        if(arg.key !== 'Enter' || !this.command.trim().length) {
            return;
        }
        this.submit();
    }

    submit() {
        this.onCommand.emit(`${this.command}:${this.argument}`);
    }

    isCommandInputFocused():boolean {
        return this.runnerInput.nativeElement === document.activeElement;
    }

    onInputKeyDown(arg:KeyboardEvent):boolean {
        if(arg.key === ':') {
            arg.preventDefault();
            arg.stopPropagation();
            arg.stopImmediatePropagation();

            this.runnerArgument.nativeElement.focus();
            return false;
        }
        return true;
    }

    onArgumentKeyUp(event:KeyboardEvent) {
        if(event.key !== "Enter" || !event.ctrlKey) {
            return;
        }
        if(!this.command) {
            this.ngAfterViewInit();
            return;
        }
        this.submit();
    }

    onArgumentChange(update:string) {
        this.argumentChange.emit(update);
    }

    onCommandChange(update:string) {
        this.commandChange.emit(update);
    }

}