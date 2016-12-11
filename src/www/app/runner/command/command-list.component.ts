import {AfterViewInit, Component, Input} from "@angular/core";
import {Command} from "./command";

require('./command-list.component.scss');

@Component({
    selector: 'up-command-list',
    templateUrl: 'command-list.component.html'
})
export class CommandListComponent implements  AfterViewInit {

    @Input() commands:Command[];

    ngAfterViewInit() {
    }

}