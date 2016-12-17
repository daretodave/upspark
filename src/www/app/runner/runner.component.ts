import {Component, OnInit, ViewChild} from "@angular/core";
import {SystemService} from "../shared/system/system.service";
import {CommandService} from "./command/command.service";
import {Command} from "./command/command";
import {SystemEvent} from "../shared/system/system-event";
import {CommandListComponent} from "./command/command-list.component";
import {RunnerSplitComponent} from "./runner-split.component";
import {CommandSnippet} from "./command/command-snippet";
import {CommandListNavigation} from "./command/command-list-navigation";

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
            (event: SystemEvent) => this.commandService.onStateChange(event.value),
            true
        );

        this.commands = this.commandService.getCommands();
    }

    private output: string = '';
    private debug: string = '';
    private argument: string = '';
    private command: string = '';
    private input: string = '';
    private title: string = '';
    private log: string[] = [];
    private split: boolean = false;
    private loading: boolean = false;
    private commands: Command[];
    private cachedCommandSnippet: CommandSnippet;

    @ViewChild("commandList") commandList: CommandListComponent;
    @ViewChild("splitRunner") splitRunner: RunnerSplitComponent;

    onBasicInputChange(value: string) {
        let blocks: string[] = value.split(":");
        let command: string = '';
        let argument: string = '';

        if (blocks.length) {
            command = blocks[0];
        }
        if (blocks.length > 1) {
            argument = blocks.slice(1).join(":");
        }

        this.command = command;
        this.argument = argument;
    }

    onRunnerKeyDown(event: KeyboardEvent) {
        if (this.loading || !event.altKey) {
            return;
        }

        let isUpArrow: boolean = event.code === "ArrowUp";
        if (isUpArrow || event.code === "ArrowDown") {
            const {reset, command, fromPristine} = this.commandService.navigate(!isUpArrow);
            if (reset) {

                this.commandList.scrollToTop();

                if (this.cachedCommandSnippet != null) {
                    this.command = this.cachedCommandSnippet.command;
                    this.argument = this.cachedCommandSnippet.argument;
                    this.input = this.cachedCommandSnippet.input;
                }

            } else if (command !== null) {
                if (fromPristine) {
                    this.cachedCommandSnippet = new CommandSnippet(this.input, this.command, this.argument);
                }

                this.commandList.lock(command);

                this.command = command.title;
                this.argument = command.argument;
                this.input = command.originalInput;
            }
            return;
        }

        let isLeftArrow: boolean = event.code === "ArrowLeft";
        if (isLeftArrow || event.code === "ArrowRight") {
            if (this.commandService.isNavigating()) {
                this.commandService.resetNavigation();
            } else {
                this.split = !this.split;
            }
        }

    }

    onCommand() {
        if (this.loading || !this.command.trim()) {
            return;
        }
        this.commandList.scrollToTop();

        this.commandService.execute(this.command, this.argument, this.input);

        this.command = this.input = this.debug = this.argument = '';
    }


    onCommandChange(value: string) {
        let input: string = `${value}`;
        if (this.argument) {
            input += `:${this.argument}`;

        }
        this.input = input;
    }

    onArgumentChange(value: string) {
        let input: string = `${this.command}`;
        if (value) {
            input += `:${value}`;

        }
        this.input = input;
    }

    toggle(): void {
        this.split = !this.split;
    }

    constructor(private system: SystemService, private commandService: CommandService) {
    }

}