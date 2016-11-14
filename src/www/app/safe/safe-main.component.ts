import {Component, AfterViewInit} from "@angular/core";
import {Router} from "@angular/router";
import {KeyValueService} from "../shared/key-value.service";
import {KeyValue} from "../shared/key-value";

const {ipcRenderer} = require('electron');

require('./safe-main.component.scss');

@Component({
    selector: 'up-safe-main',
    templateUrl: 'safe-main.component.html'
})
export class SafeMainComponent implements AfterViewInit {

    private values:KeyValue[];

    constructor(private router:Router, private service:KeyValueService) {
    }

    ngAfterViewInit(): void {
        this.values = this.service.data;
        console.log(this.values);
    }

    lock() {
        ipcRenderer.send('safe-lock');
    }

    exp() {
        ipcRenderer.send('safe-lock');
    }

}