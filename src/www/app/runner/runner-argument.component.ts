import {Component, OnInit, ElementRef, Input, ViewChild, Output, EventEmitter} from "@angular/core";
import {RunnerArgument} from "./runner-argument";

require('./runner-argument.component.scss');

@Component({
    selector: 'up-runner-argument',
    templateUrl: 'runner-argument.component.html',
})
export class RunnerArgumentComponent implements OnInit {

    @ViewChild('content') content:ElementRef;
    @Input('argument') argument:RunnerArgument;
    @Output() onRemoveRequest = new EventEmitter<RunnerArgument>();

    ngOnInit() {
       this.focus();
    }

    onContentKeyDown(event:KeyboardEvent) {
    }

    constructor() {
    }

    focus() {
        this.content.nativeElement.focus();
    }
}