import {Component, OnInit, ViewChild} from "@angular/core";
import {SystemService} from "../shared/system/system.service";
import {CommandService} from "./command/command.service";
import {Command} from "./command/command";
import {SystemEvent} from "../shared/system/system-event";
import {CommandListComponent} from "./command/command-list.component";
import {RunnerSplitComponent} from "./runner-split.component";
import {CommandSnippet} from "./command/command-snippet";
import {CommandListNavigation} from "./command/command-list-navigation";
import {RunnerMode} from "./runner-mode";

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
    private cachedCursor: number = -1;

    private mode:RunnerMode = RunnerMode.NORMAL;

    private modeNormal:RunnerMode = RunnerMode.NORMAL;
    private modeTerminal:RunnerMode = RunnerMode.TERMINAL;
    private modeInternal:RunnerMode = RunnerMode.INTERNAL;

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

    onRunnerKeyDown(event: KeyboardEvent) :boolean {
        if (this.loading
            || (this.split
            && this.splitRunner.isArgumentFocused()
            && !event.altKey)) {
            return true;
        }

        let isLeftArrow: boolean = event.code === "ArrowLeft",
            isRightArrow: boolean = event.code === "ArrowRight",
            isUpArrow: boolean = event.code === "ArrowUp",
            isDownArrow:boolean = event.code === "ArrowDown";

        if(!(isLeftArrow && this.commandService.isNavigating()) && !(isRightArrow && event.altKey) && !isUpArrow && !isDownArrow) {
            return true;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        if (isUpArrow || isDownArrow) {
            const {reset, command, fromPristine, fromCursor} = this.commandService.navigate(!isUpArrow);
            if (reset) {
                this.resetCommandList(fromCursor, true, true);

            } else if (command !== null) {
                if (fromPristine) {
                    this.cachedCommandSnippet = new CommandSnippet(this.input, this.command, this.argument);
                }

                this.commandList.lock(command);

                this.command = command.title;
                this.argument = command.argument;
                this.input = command.originalInput;
            }
        } else if ((isLeftArrow || isRightArrow) && event.ctrlKey) {
            this.split = !this.split;
        }  else if (isLeftArrow) {
            this.resetCommandList(this.commandService.getCursor(), event.altKey);
        } else if (isRightArrow && event.altKey) {
            this.resetCachedCommandList();
        }

        return false;
    }

    resetCommandList(cursor: number, resetCachedCommand:boolean, overrideCurrentState:boolean = false) {
        if (!overrideCurrentState && !this.commandService.isNavigating()) {
            return;
        }

        this.cachedCursor = cursor;

        if (this.cachedCommandSnippet != null && resetCachedCommand) {
            this.command = this.cachedCommandSnippet.command;
            this.argument = this.cachedCommandSnippet.argument;
            this.input = this.cachedCommandSnippet.input;
        }
        this.cachedCommandSnippet = null;

        this.commandList.scrollToTop();

        this.commandService.resetNavigation();
    }

    resetCachedCommandList() {
        if(this.cachedCursor === -1 || this.commandService.isNavigating()) {
            return;
        }
        const {command} =this.commandService.goToCursor(this.cachedCursor);

        this.cachedCommandSnippet = new CommandSnippet(this.input, this.command, this.argument);

        this.commandList.lock(command);

        this.command = command.title;
        this.argument = command.argument;
        this.input = command.originalInput;

        this.cachedCursor = -1;
    }

    onCommand() {
        if (this.loading || (!this.command.trim() && !this.argument.trim())) {
            return;
        }

        let isNavigating:boolean = this.commandService.isNavigating();

        this.cachedCommandSnippet = null;

        if(isNavigating) {
            this.commandList.scrollToTop();
            this.commandService.resetNavigation();
        }

        this.commandService.execute(this.command, this.argument, this.input);

        if(isNavigating) {
            this.commandService.navigate(true);
        }

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