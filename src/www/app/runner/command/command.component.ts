import {Component, Input, Renderer, Output, EventEmitter, HostListener} from "@angular/core";
import {Command} from "./command";

require('./command.component.scss');

@Component({
    selector: 'up-command',
    templateUrl: 'command.component.html'
})
export class CommandComponent {

    @Input() command:Command;
    @Output() onCommandDetach:EventEmitter<string> = new EventEmitter<string>();

    constructor(private renderer:Renderer) {
    }

    @HostListener('mouseenter') onMouseEnter() {
        this.command.hover = true;
    }
    @HostListener('mouseleave') onMouseLeave() {
        this.command.hover = false;
        this.command.lastInteraction = Date.now();
    }

}