import {Component, OnInit, ViewChild} from "@angular/core";
import {SystemService} from "../shared/system/system.service";
import {CommandService} from "./command/command.service";
import {Command} from "./command/command";
import {SystemEvent} from "../shared/system/system-event";
import {CommandListComponent} from "./command/command-list.component";

require('./runner.component.scss');

@Component({
    selector: 'up-runner',
    templateUrl: 'runner.component.html',
})
export class RunnerComponent implements OnInit {
    ngOnInit() {
        this.system.handleStyleBroadcast(
            'css--runner-custom',
            'css--runner-theme',
            'css--runner-metrics'
        );

        this.system.subscribeToBroadcast(
            'command-state-change',
            (event:SystemEvent) => this.commandService.onStateChange(event.value),
            true
        );

        this.commands = this.commandService.getCommands();
    }

    private output:string = '';
    private debug:string = '';
    private argument:string = '';
    private command:string = '';
    private input:string = '';
    private title:string = '';
    private log:string[] = [];
    private split:boolean = false;
    private loading:boolean = false;
    private commands:Command[];

    @ViewChild("commandList") commandList:CommandListComponent;

    onBasicInputChange(value:string) {
        let blocks:string[] = value.split(":");
        let command:string = '';
        let argument:string = '';

        if(blocks.length) {
            command = blocks[0];
        }
        if(blocks.length > 1) {
            argument = blocks.slice(1).join(":");
        }

        this.command = command;
        this.argument = argument;
    }

    onCommand() {
        if(this.loading || !this.command.trim()) {
            return;
        }
        this.commandList.scrollToTop();

        this.commandService.execute(this.command, this.argument);

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

    constructor(private system:SystemService, private commandService:CommandService) {
    }

}