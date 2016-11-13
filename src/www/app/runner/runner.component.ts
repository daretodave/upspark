import {Component, AfterViewInit, OnInit} from '@angular/core';

const {ipcRenderer} = require('electron');

@Component({
    selector: 'up-runner',
    templateUrl: 'runner.component.html'
})
export class RunnerComponent implements OnInit {

    ngOnInit(): void {
        ipcRenderer.on('style', (event:any, arg:string) => {
            console.log(arg);
        });
    }

    constructor() {
    }

}