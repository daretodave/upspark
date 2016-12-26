import {Component, OnInit, ElementRef, Input, ViewChild, Output, EventEmitter} from "@angular/core";
import {CommandArgument} from "../../../../app/model/command/command-argument";

require('./command-argument.component.scss');

@Component({
    selector: 'up-command-argument',
    templateUrl: 'command-argument.component.html',
})
export class CommandArgumentComponent implements OnInit {

    @ViewChild('content') content:ElementRef;
    @Input('argument') argument:CommandArgument;
    @Output() onRemoveRequest = new EventEmitter<CommandArgument>();

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