import {Component, OnInit, ViewChild, ContentChildren, QueryList, ElementRef, ViewChildren} from "@angular/core";
import {SystemService} from "../shared/system/system.service";
import {CommandService} from "./command/command.service";
import {SystemEvent} from "../shared/system/system-event";
import {CommandListComponent} from "./command/command-list.component";
import {CommandSnippet} from "./command/command-snippet";
import {RunnerInput} from "./runner-input";
import {RunnerArgument} from "./runner-argument";
import {RunnerArgumentComponent} from "./runner-argument.component";

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
        this.runnerInput.nativeElement.focus();
    }

    private input:RunnerInput = new RunnerInput();
    private cachedCommandSnippet: CommandSnippet;
    private cachedCursor: number = -1;

    @ViewChildren('argument')
    private argumentList: QueryList<RunnerArgumentComponent>;
    @ViewChild("runnerInput")
    private runnerInput: ElementRef;
    @ViewChild("commandList")
    private commandList: CommandListComponent;

    onRunnerInputKeyDown(event: KeyboardEvent):boolean {
       if(event.code === "Semicolon") {
           console.log(this.argumentList.first);
           if(!this.argumentList.first) {
               this.input.arguments.push(new RunnerArgument());
           } else {
               this.argumentList.first.focus();
           }
           return false;
       }
       return true;
    }

    onRunnerKeyDown(event: KeyboardEvent) :boolean {
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
                   // this.cachedCommandSnippet = new CommandSnippet(this.input, this.command, this.argument);
                }

                this.commandList.lock(command);

                //this.command = command.title;
                //this.argument = command.argument;
                //this.input = command.originalInput;
            }
        } else if (isLeftArrow) {
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
            //this.command = this.cachedCommandSnippet.command;
            //this.argument = this.cachedCommandSnippet.argument;
            //this.input = this.cachedCommandSnippet.input;
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

//        this.cachedCommandSnippet = new CommandSnippet(this.input, this.command, this.argument);

        this.commandList.lock(command);

        //this.command = command.title;
        //this.argument = command.argument;
        //this.input = command.originalInput;

        this.cachedCursor = -1;
    }

    onCommand() {
        // if (this.loading || (!this.command.trim() && !this.argument.trim())) {
        //     return;
        // }

        let isNavigating:boolean = this.commandService.isNavigating();

        this.cachedCommandSnippet = null;

        if(isNavigating) {
            this.commandList.scrollToTop();
            this.commandService.resetNavigation();
        }

        //this.commandService.execute(this.command, this.argument, this.input);

        if(isNavigating) {
            this.commandService.navigate(true);
        }

        //this.command = this.input = this.debug = this.argument = '';
    }

    constructor(private system: SystemService, private commandService: CommandService) {
    }

}