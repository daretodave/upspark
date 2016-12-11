import {AfterViewInit, Component, Input, EventEmitter, Output} from "@angular/core";
import {Command} from "./command";
import {Observable} from "rxjs";

require('./command-list.component.scss');

@Component({
    selector: 'up-command-list',
    templateUrl: 'command-list.component.html'
})
export class CommandListComponent implements  AfterViewInit {

    @Input() commands:Command[];
    @Output() onCommandDetach:EventEmitter<string> = new EventEmitter<string>();

    onCommandDetachRequest(id:string) {
        this.onCommandDetach.emit(id);
    }

    cleanStaleData() {
        this.commands.forEach((command:Command) => {

        })
    }

    ngAfterViewInit() {
        Observable.timer(1000, 1000).subscribe(this.cleanStaleData)
    }



}