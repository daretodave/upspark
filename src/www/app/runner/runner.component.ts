import {
    Component, OnInit, ViewChild, QueryList, ElementRef, ViewChildren, style, animate,
    transition, trigger
} from "@angular/core";
import {SystemService} from "../shared/system/system.service";
import {CommandService} from "./command/command.service";
import {SystemEvent} from "../shared/system/system-event";
import {CommandListComponent} from "./command/command-list.component";
import {CommandIntent} from "../../../app/model/command/command-intent";
import {CommandArgumentComponent} from "./command-argument/command-argument.component";
import {CommandArgument} from "../../../app/model/command/command-argument";
import {Command} from "../../../app/model/command/command";
import {CommandWrapper} from "./command/command-wrapper";

require('./runner.component.scss');

@Component({
    selector: 'up-runner',
    templateUrl: 'runner.component.html',
    animations: [
        trigger('expand', [
            transition('void => *', [
                style({width: '0'}),
                animate(100, style({width: '*'}))
            ]),
            transition('* => void', [
                style({width: '*'}),
                animate(100, style({width: '0'}))
            ])
        ]),
    ]
})
export class RunnerComponent implements OnInit {

    @ViewChildren('argument')
    private argumentList: QueryList<CommandArgumentComponent>;
    @ViewChild("runnerInput")
    private runnerInput: ElementRef;
    @ViewChild("commandList")
    private commandList: CommandListComponent;

    private intent: CommandIntent = new CommandIntent();
    private savedIntent: CommandIntent;
    private savedCursor: number = -1;
    private command: CommandWrapper;


    constructor(private system: SystemService,
                private commandService: CommandService) {
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
    }

    onRunnerKeyDown(event: KeyboardEvent): boolean {
        const {code, shiftKey, ctrlKey} = event;
        const args = this.argumentList.length;

        if("Space" === code && ((shiftKey && args) || ctrlKey)) {

            let focusedIndex:number = -1;
            this.argumentList.forEach((argument:CommandArgumentComponent, index:number) => {
                if(document.activeElement === argument.content.nativeElement) {
                    focusedIndex = index;
                }
            });

            if(shiftKey) {
                if(focusedIndex > 0) {
                    this.argumentList.toArray()[focusedIndex-1].content.nativeElement.focus();
                    return false;
                } else if(focusedIndex !== 0) {
                    this.argumentList.toArray()[args-1].content.nativeElement.focus();
                    return false;
                }
                this.runnerInput.nativeElement.focus();
                return false;
            }

            if(focusedIndex !== -1 && focusedIndex !== args -1) {
                this.argumentList.toArray()[focusedIndex+1].content.nativeElement.focus();
                return false;
            }

            this.intent.arguments.push(new CommandArgument());
            return false;
        }

        if ("Enter" === code || "NumpadEnter" === code) {

            if(ctrlKey && shiftKey) {
                this.intent = new CommandIntent();
                this.runnerInput.nativeElement.focus();
                return false;
            }

            if (shiftKey) {
                if(args === 0) {
                    this.intent.command = '';
                    this.runnerInput.nativeElement.focus();
                    return false;
                }
                if(args === 1) {
                    this.runnerInput.nativeElement.focus();
                } else {
                    this.argumentList.toArray()[args-2].content.nativeElement.focus();
                }
                this.intent.arguments.pop();
                return false;
            }

            if (ctrlKey || document.activeElement === this.runnerInput.nativeElement) {
                this.command = this.commandService.execute(new CommandIntent(this.intent));

                this.intent.arguments = [];
                this.intent.command = "";
                return false;
            }
        }

        // let isLeftArrow: boolean = event.code === "ArrowLeft",
        //     isRightArrow: boolean = event.code === "ArrowRight",
        //     isUpArrow: boolean = event.code === "ArrowUp",
        //     isDownArrow: boolean = event.code === "ArrowDown";
        //
        // if (!(isLeftArrow && this.commandService.isNavigating()) && !(isRightArrow && event.altKey) && !isUpArrow && !isDownArrow) {
        //     return true;
        // }
        //
        // event.preventDefault();
        // event.stopImmediatePropagation();
        // event.stopPropagation();
        //
        // if (isUpArrow || isDownArrow) {
        //     const {reset, command, fromPristine, fromCursor} = this.commandService.navigate(!isUpArrow);
        //     if (reset) {
        //         this.resetCommandList(fromCursor, true, true);
        //
        //     } else if (command !== null) {
        //         if (fromPristine) {
        //             this.savedIntent = new CommandIntent(this.intent);
        //         }
        //
        //         this.commandList.lock(command);
        //
        //         this.intent = new CommandIntent(command.reference.intent);
        //     }
        // } else if (isLeftArrow) {
        //     this.resetCommandList(this.commandService.getCursor(), event.altKey);
        // } else if (isRightArrow && event.altKey) {
        //     this.resetCachedCommandList();
        // }

        return true;
    }

    resetCommandList(cursor: number, resetCachedCommand: boolean, overrideCurrentState: boolean = false) {
        if (!overrideCurrentState && !this.commandService.isNavigating()) {
            return;
        }

        this.savedCursor = cursor;

        if (this.savedIntent != null && resetCachedCommand) {
            this.intent = new CommandIntent(this.savedIntent);
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

        this.savedIntent = this.intent;
        
        this.commandList.lock(command);

        this.intent = new CommandIntent(command.reference.intent);
        
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