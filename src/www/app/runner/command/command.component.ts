import {Component, Input} from "@angular/core";
import {Command} from "./command";

require('./command.component.scss');

@Component({
    selector: 'up-command',
    templateUrl: 'command.component.html'
})
export class CommandComponent {

    @Input() command:Command;

}