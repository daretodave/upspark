import {Component, AfterViewInit, OnInit} from '@angular/core';

const {ipcRenderer} = require('electron');

@Component({
    selector: 'up-runner',
    templateUrl: 'runner.component.html',
    styleUrls: ['runner.component.scss']
})
export class RunnerComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        ipcRenderer.on('style', (event:any, arg:string) => {

            let style = document.getElementById('runnerWindow-style');
            if (style === null) {
                style = document.createElement('style');
                document.head.appendChild(style);
            }

            style.innerHTML = arg;
        });
    }

    constructor() {
    }

}