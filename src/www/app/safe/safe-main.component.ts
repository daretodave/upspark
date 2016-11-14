import {Component, AfterViewInit} from "@angular/core";
import {Router} from "@angular/router";

const {ipcRenderer} = require('electron');

require('./safe-main.component.scss');

@Component({
    selector: 'up-safe-main',
    templateUrl: 'safe-main.component.html'
})
export class SafeMainComponent implements AfterViewInit {

    constructor(private router:Router) {
    }

    ngAfterViewInit(): void {
    }

    lock() {
        ipcRenderer.send('safe-lock');
    }

}