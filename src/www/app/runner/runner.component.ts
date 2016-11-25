import {Component, AfterViewInit} from "@angular/core";

const {ipcRenderer} = require('electron');

require('./runner.component.scss');

@Component({
    selector: 'up-runner',
    templateUrl: 'runner.component.html',
})
export class RunnerComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        ipcRenderer.removeAllListeners('style');
        ipcRenderer.removeAllListeners('metrics');
        ipcRenderer.removeAllListeners('style-runner');

        ipcRenderer.on('style', (event:any, arg:string) => {

            let style = document.getElementById('runner-style');
            if (style === null) {
                style = document.createElement('style');
                style.setAttribute("id", "runner-style");

                document.head.appendChild(style);
            }

            style.innerHTML = arg;
        });

        ipcRenderer.on('style-runner', (event:any, arg:string) => {

            let style = document.getElementById('runner-theme');
            if (style === null) {
                style = document.createElement('style');
                style.setAttribute("id", "runner-theme");

                document.head.appendChild(style);
            }

            style.innerHTML = arg;
        });

        ipcRenderer.on('metrics', (event:any, arg:string) => {

            let style = document.getElementById('metrics');
            if (style === null) {
                style = document.createElement('style');
                style.setAttribute("id", 'metrics');

                document.head.appendChild(style);
            }

            style.innerHTML = arg;
        });
    }

    constructor() {
    }

}