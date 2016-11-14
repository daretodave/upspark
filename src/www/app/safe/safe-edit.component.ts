import {Component, OnInit} from '@angular/core';
import {KeyValue} from "../shared/key-value";

require('./safe-edit.component.scss');

@Component({
    selector: 'up-safe-edit',
    templateUrl: 'safe-edit.component.html'
})
export class SafeEditComponent implements OnInit {

    private model:KeyValue;

    ngOnInit() {

    }

    constructor() {
    }

}