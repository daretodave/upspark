import {Component, AfterViewInit, NgZone} from "@angular/core";
import {CommandResponse} from "../../../app/api/command-response";
import {SystemService} from "../shared/system/system.service";
import {SystemEvent} from "../shared/system/system-event";
import {CommandTask} from "../../../app/api/command-task";

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

        this.system.subscribeToBroadcast('command-task-create', event => this.onCommandResponse(event.value), true);

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
        if(this.loading || !value ) {
            return;
        }
        this.loading = true;

        ipcRenderer.send('command', value);
    }

    onCommandResponse(response:CommandResponse) {
        this.loading = false;

        this.input = '';
        this.command = '';

        this.debug = response.debug;
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

    constructor(private zone:NgZone, private system:SystemService) {
    }

}