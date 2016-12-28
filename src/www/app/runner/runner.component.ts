import {Component, OnInit, ViewChild, QueryList, ElementRef, ViewChildren} from "@angular/core";
import {SystemService} from "../shared/system/system.service";
import {CommandService} from "./command/command.service";
import {SystemEvent} from "../shared/system/system-event";
import {CommandListComponent} from "./command/command-list.component";
import {CommandIntent} from "../../../app/model/command/command-intent";
import {CommandArgumentComponent} from "./command-argument/command-argument.component";
import {ElementStateQuery} from "../shared/element-state-query";
import {CommandArgument} from "../../../app/model/command/command-argument";

require('./runner.component.scss');

@Component({
    selector: 'up-runner',
    templateUrl: 'runner.component.html',
})
export class RunnerComponent implements OnInit {

    private intent: CommandIntent = new CommandIntent();
    private inputGroup: ElementStateQuery = new ElementStateQuery();
    private savedIntent: CommandIntent;
    private savedCursor: number = -1;


    constructor(private system: SystemService,
                private commandService: CommandService,
                @ViewChildren('argument')
                private argumentList: QueryList<CommandArgumentComponent>,
                @ViewChild("runnerInput")
                private runnerInput: ElementRef,
                @ViewChild("commandList")
                private commandList: CommandListComponent) {
    }

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

        this.inputGroup.attach("input", this.runnerInput.nativeElement);
        this.inputGroup.attach("argument", () => this.argumentList.map(
            (argument:CommandArgumentComponent) => argument.content.nativeElement
        ))
    }



    onRunnerKeyDown(event: KeyboardEvent): boolean {

        if (event.code === "Enter") {
            if (event.shiftKey) {
                // navigate back

                return;
            }

            if (event.ctrlKey) {
                // execute

                return;
            }


            return;
        }

        let isLeftArrow: boolean = event.code === "ArrowLeft",
            isRightArrow: boolean = event.code === "ArrowRight",
            isUpArrow: boolean = event.code === "ArrowUp",
            isDownArrow: boolean = event.code === "ArrowDown";

        if (!(isLeftArrow && this.commandService.isNavigating()) && !(isRightArrow && event.altKey) && !isUpArrow && !isDownArrow) {
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

    resetCommandList(cursor: number, resetCachedCommand: boolean, overrideCurrentState: boolean = false) {
        if (!overrideCurrentState && !this.commandService.isNavigating()) {
            return;
        }

        this.savedCursor = cursor;

        if (this.savedIntent != null && resetCachedCommand) {
            //this.command = this.cachedCommandSnippet.command;
            //this.argument = this.cachedCommandSnippet.argument;
            //this.input = this.cachedCommandSnippet.input;
        }
        this.savedIntent = null;

        this.commandList.scrollToTop();

        this.commandService.resetNavigation();
    }

    resetCachedCommandList() {
        if (this.savedCursor === -1 || this.commandService.isNavigating()) {
            return;
        }
        const {command} =this.commandService.goToCursor(this.savedCursor);

//        this.cachedCommandSnippet = new CommandSnippet(this.input, this.command, this.argument);

        this.commandList.lock(command);

        //this.command = command.title;
        //this.argument = command.argument;
        //this.input = command.originalInput;

        this.savedCursor = -1;
    }

    execute(navigate: boolean = true, input: CommandIntent = this.intent) {
        this.savedIntent = null;

        if (navigate && this.commandService.isNavigating()) {
            this.commandList.scrollToTop();
            this.commandService.resetNavigation();
        }

        this.commandService.execute(input);

        if (navigate) {
            this.commandService.navigate(true);
        }
    }



}