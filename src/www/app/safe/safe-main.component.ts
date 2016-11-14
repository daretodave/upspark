import {Component, AfterViewInit, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {KeyValueService} from "../shared/key-value.service";
import {KeyValue} from "../shared/key-value";

const {ipcRenderer} = require('electron');

require('./safe-main.component.scss');

@Component({
    selector: 'up-safe-main',
    templateUrl: 'safe-main.component.html',
})
export class SafeMainComponent implements OnInit {

    private values:KeyValue[];
    private filter:string;

    constructor(private router:Router, private service:KeyValueService) {
    }

    ngOnInit(): void {
        this.filter = '';
        this.values = this.service.data;

    }

    lock() {
        ipcRenderer.send('safe-lock');
    }

    exp() {
        ipcRenderer.send('safe-lock');
    }

}