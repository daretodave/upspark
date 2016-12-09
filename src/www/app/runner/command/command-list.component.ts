import {AfterViewInit, Component} from "@angular/core";

require('./command-list.component.scss');

@Component({
    selector: 'up-command-list',
    templateUrl: 'command-list.component.html'
})
export class CommandListComponent implements  AfterViewInit {

    ngAfterViewInit() {
    }

}