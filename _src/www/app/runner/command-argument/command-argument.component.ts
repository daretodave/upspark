import {Component, OnInit, ElementRef, Input, ViewChild} from "@angular/core";
import {CommandArgument} from "../../../../app/model/command/command-argument";

require('./command-argument.component.scss');

@Component({
    selector: 'up-command-argument',
    templateUrl: 'command-argument.component.html',

})
export class CommandArgumentComponent implements OnInit {

    @ViewChild('content') content:ElementRef;
    @Input('argument') argument:CommandArgument;

    constructor() {
    }

    ngOnInit() {
        if(this.argument.focus) {
            this.focus();
        }
        //this.resize();
    }

    resize():boolean {

        this.content.nativeElement.style.height = "auto";

        let scrollHeight:number = this.content.nativeElement.scrollHeight;

        this.content.nativeElement.style.height = `${scrollHeight}px`;

        return true;
    }

    focus() {
        this.content.nativeElement.focus();
    }
}