import {Component, Input, HostListener} from "@angular/core";
import {Command} from "./command";

require('./command.component.scss');

@Component({
    selector: 'up-command',
    templateUrl: 'command.component.html'
})
export class CommandComponent {

    @Input() command: Command;

    @HostListener('mouseenter') onMouseEnter() {
        this.command.hover = true;
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.command.hover = false;
    }

}