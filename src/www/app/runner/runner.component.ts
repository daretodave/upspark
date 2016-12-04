import {Component, AfterViewInit} from "@angular/core";

const {ipcRenderer} = require('electron');

require('./runner.component.scss');

@Component({
    selector: 'up-runner',
    templateUrl: 'runner.component.html',
})
export class RunnerComponent implements AfterViewInit {

    private output:string = '';
    private debug:string = '';
    private argument:string = '';
    private command:string = '';
    private input:string = '';
    private title:string = '';
    private log:string[] = [];
    private split:boolean = false;
    private loading:boolean = false;

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

    onBasicInputChange(value:string) {
        let blocks:string[] = value.split(":", 2);
        let command:string = '';
        let argument:string = '';

        if(blocks.length) {
            command = blocks[0];
        }
        if(blocks.length > 1) {
            argument = blocks[1];
        }

        this.command = command;
        this.argument = argument;
    }

    onCommandChange(value:string) {
        let input:string = `${value}`;
        if(this.argument) {
            input += `:${this.argument}`;

        }
        this.input = input;
    }
    onArgumentChange(value:string) {
        let input:string = `${this.command}`;
        if(value) {
            input += `:${value}`;

        }
        this.input = input;
    }

    toggle(): void {
        this.split = !this.split;
        console.log(this.input);
    }

    constructor() {
    }

}