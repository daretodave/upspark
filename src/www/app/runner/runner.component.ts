import {Component, AfterViewInit, NgZone} from "@angular/core";
import {SystemService} from "../shared/system/system.service";

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
        this.system.handleStyleBroadcast(
            'css--runner-custom',
            'css--runner-theme',
            'css--runner-metrics'
        );
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

    onCommand(value:string) {
        if(this.loading || !value) {
            return;
        }

        this.command = this.input = this.debug = this.argument = '';
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
    }

    constructor(private system:SystemService) {
    }

}