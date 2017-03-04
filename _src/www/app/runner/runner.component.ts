import {Component, OnInit, ViewChild, QueryList, ElementRef, ViewChildren} from "@angular/core";
import {SystemService} from "../shared/system/system.service";
import {CommandService} from "./command/command.service";
import {SystemEvent} from "../shared/system/system-event";
import {CommandListComponent} from "./command/command-list.component";
import {CommandIntent} from "../../../app/model/command/command-intent";
import {CommandArgumentComponent} from "./command-argument/command-argument.component";
import {CommandArgument} from "../../../app/model/command/command-argument";
import {CommandWrapper} from "./command/command-wrapper";
import {CommandUpdate} from "../../../app/model/command/command-update/command-update";
import {CommandRuntime} from "../../../app/model/command/command-runtime";
import {Command} from "../../../app/model/command/command";
import {BrowserStore} from "../../../app/model/browser-store";
import {CommandIntentDigest} from "../../../app/model/command/command-intent-digest";

require('./runner.component.scss');

@Component({
    selector: 'up-runner',
    templateUrl: 'runner.component.html'
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
    private savedReplIntent: CommandIntent;
    private savedCursor: number = -1;
    private command: CommandWrapper;
    private cwd: string = '';
    private repl: boolean = false;

    constructor(private system: SystemService,
                private commandService: CommandService) {
    }

    robInput(event:any):boolean {
        event.stopPropagation();

        return false;
    }

    focusInput() {
        this.runnerInput.nativeElement.focus();
    }

    update() {
        this.repl = this.command
            && this.command.repl
            && this.command.active
            && !this.command.reference.completed;
    }

    ngOnInit() {
        this.system.handleStyleBroadcast(
            'css--runner-custom',
            'css--runner-theme',
            'css--runner-metrics'
        );
        this.system.subscribeToBroadcast(
            'command-state-change',
            (event: SystemEvent) => {
                let update: CommandUpdate = event.value;
                let isCompleted: boolean = this.commandService.onStateChange(update);

                if (this.repl
                    && isCompleted
                    && this.command
                    && this.command.reference.id === update.id) {
                    this.restorePreREPLIntent();
                } else {
                    this.update();
                }

            },
            true
        );

        this.system.subscribeToBroadcast('get-tasks', (event: SystemEvent) => {
            let commands: Command[] = this.commandService
                .getCommands()
                .map(wrapper => wrapper.reference);

            console.log('GET-TASKS', commands.length, 'TO', event.value);

            this.system.send('system-message', {
                id: event.value,
                payload: commands,
                error: false
            });

        });

        this.system.subscribeToBroadcast('cwd-update', (event: SystemEvent) => {
            this.cwd = event.get<string>('cwd');
        }, true, 'cwd');
        this.system.subscribeToBroadcast('clear-tasks', (event: SystemEvent) => this.clear(true), true);
        this.system.subscribeToBroadcast('end-tasks', (event: SystemEvent) => this.endTasks(), true);

        this.system.subscribeToBroadcast('end-task', (event: SystemEvent) => this.endTask(event.value), true);

        this.runnerInput.nativeElement.focus();

        BrowserStore
            .getCollection<CommandIntent>(Command.STORAGE_KEY)
            .then((intents: CommandIntent[]) => this.commandService.adhoc(...intents));
    }

    onCommandClick(command: CommandWrapper) {
        console.log('CLICKED COMMAND', command);

        this.commandService.goToCursor(this
            .commandService
            .getCursorForCommand(command)
        );

        this.toCommand(
            command,
            this.commandService.isNavigating()
        );

        this.repl = false;
    }

    resetCommandFocus() {
        if (this.command !== null) {
            this.command.repl = false;
            this.command = null;
        }

        this.update();
    }

    toCommand(command: CommandWrapper, fromPristine: boolean = false, requestFocus: boolean = true) {
        console.log('NAVIGATE TO COMMAND', command, fromPristine);
        if (!command) {
            return;
        }

        if (this.command) {
            if ((this.command.reference.id !== command.reference.id)) {
                this.command.active = false;
            }
            this.command.repl = false;
        }

        if (fromPristine) {
            this.savedIntent = new CommandIntent(this.intent);
        }

        this.commandList.lock(command);
        this.command = command;

        this.intent = new CommandIntent(command.reference.intent);

        if (requestFocus) {
            this.runnerInput.nativeElement.focus();
        }

        this.update();
    }

    clear(clearHistory: boolean = false) {
        this.commandList.scrollToTop();
        this.commandService.resetNavigation();
        this.runnerInput.nativeElement.focus();
        this.intent.arguments = [];
        this.intent.command = "";
        this.resetCommandFocus();

        if (clearHistory) {
            this.commandList.toStaleState();
        }
    }

    endTask(id: string) {
        let command: CommandWrapper = this.commandService.getCommands().find(command => command.reference.id === id);

        console.log('END', id);

        if (command === null) {
            console.error(`Could not find task with id ${id}`);
            return;
        }

        let type: CommandRuntime = CommandRuntime.get(command.reference.intent.command);

        this.system.send('command-end', command.reference.id, type);
    }

    endTasks() {
        this.commandService.getCommands().forEach((wrapper: CommandWrapper) => {
            if (!wrapper.reference.completed) {
                console.log('END', wrapper.reference.id);

                let type: CommandRuntime = CommandRuntime.get(wrapper.reference.intent.command);

                this.system.send('command-end', wrapper.reference.id, type);
            }
        });
    }

    onRunnerKeyDown(event: KeyboardEvent): boolean {
        const {code, shiftKey, ctrlKey} = event;
        const args = this.argumentList.length;

        if ("KeyC" === code
            && ctrlKey
            && this.command
            && this.command.active
            && !this.command.reference.completed) {

            let type: CommandRuntime = CommandRuntime.get(this.command.reference.intent.command);

            console.log('CANCEL', this.command.reference.id, type, this.command);

            this.system.send('command-end', this.command.reference.id, type);

            return false;
        }

        if ("Escape" === code) {
            this.clear(shiftKey);
            return false;
        }

        if ("Space" === code && ((shiftKey && args) || ctrlKey)) {

            let focusedIndex: number = -1;
            this.argumentList.forEach((argument: CommandArgumentComponent, index: number) => {
                if (document.activeElement === argument.content.nativeElement) {
                    focusedIndex = index;
                }
            });

            if (shiftKey) {
                if (focusedIndex > 0) {
                    this.argumentList.toArray()[focusedIndex - 1].content.nativeElement.focus();
                    return false;
                } else if (focusedIndex !== 0) {
                    this.argumentList.toArray()[args - 1].content.nativeElement.focus();
                    return false;
                }
                this.runnerInput.nativeElement.focus();
                return false;
            }

            if (focusedIndex !== -1 && focusedIndex !== args - 1) {
                this.argumentList.toArray()[focusedIndex + 1].content.nativeElement.focus();
                return false;
            }

            this.intent.arguments.push(new CommandArgument());
            return false;
        }

        if ("Enter" === code || "NumpadEnter" === code) {

            if (ctrlKey && shiftKey) {
                this.intent = new CommandIntent();
                this.runnerInput.nativeElement.focus();
                return false;
            }

            if (shiftKey) {
                if (args === 0) {
                    this.intent.command = '';
                    this.runnerInput.nativeElement.focus();
                    return false;
                }
                if (args === 1) {
                    this.runnerInput.nativeElement.focus();
                } else {
                    this.argumentList.toArray()[args - 2].content.nativeElement.focus();
                }
                this.intent.arguments.pop();
                return false;
            }

            if (ctrlKey || document.activeElement === this.runnerInput.nativeElement) {

                if (this.repl) {
                    this.sendToREPL();
                } else {
                    this.execute();
                }

                return false;
            }

        }

        let isLeftArrow: boolean = event.code === "ArrowLeft",
            isRightArrow: boolean = event.code === "ArrowRight",
            isUpArrow: boolean = event.code === "ArrowUp",
            isDownArrow: boolean = event.code === "ArrowDown";

        if (!(isLeftArrow && this.commandService.isNavigating())
            && !(isRightArrow && ((this.commandService.isNavigating() && this.command
            && !this.command.reference.completed
            && !CommandRuntime.is(this.command.reference.intent.command, CommandRuntime.INTERNAL)) || event.altKey))
            && !isUpArrow
            && !isDownArrow) {

            return true;
        }

        if (isUpArrow || isDownArrow) {
            const {reset, command, fromPristine, fromCursor} = this.commandService.navigate(!isUpArrow);
            if (reset) {
                this.resetCommandList(fromCursor, true, true);
                this.resetCommandFocus();
            } else if (command !== null) {
                this.toCommand(command, fromPristine, false);
            } else {
                this.resetCommandFocus();
            }
        } else if (isLeftArrow) {

            if (!this.repl) {
                this.resetCommandList(this.commandService.getCursor(), event.altKey);
            } else {
                this.restorePreREPLIntent();
            }

        } else if (isRightArrow) {
            if (event.altKey) {
                this.resetCachedCommandList();
            } else if (this.commandService.isNavigating()
                && this.command
                && !this.command.reference.completed
                && !CommandRuntime.is(this.command.reference.intent.command, CommandRuntime.INTERNAL)) {

                this.toREPL();
            }
        }

        this.runnerInput.nativeElement.focus();

        return false;
    }

    toREPL() {
        this.repl = true;

        this.command.repl = true;

        this.savedReplIntent = this.intent;

        this.intent.arguments = [];
        this.intent.command = "";
    }

    resetCommandList(cursor: number, resetCachedCommand: boolean, overrideCurrentState: boolean = false) {
        if (!overrideCurrentState && !this.commandService.isNavigating()) {
            return;
        }

        this.savedCursor = cursor;

        if (this.savedIntent !== null && resetCachedCommand) {
            this.intent = new CommandIntent(this.savedIntent);
        }
        this.savedIntent = null;
        this.savedReplIntent = null;

        this.commandList.scrollToTop();

        this.commandService.resetNavigation();
    }

    restorePreREPLIntent() {
        if (this.repl) {
            this.repl = false;

            if (this.command) {
                this.command.repl = false;
            }

            if (this.savedReplIntent !== null) {
                this.intent = new CommandIntent(this.savedReplIntent);
            }
        }
    }

    resetCachedCommandList() {
        if (this.savedCursor === -1 || this.commandService.isNavigating()) {
            return;
        }
        const {command} = this.commandService.goToCursor(this.savedCursor);

        this.savedIntent = this.intent;

        this.commandList.lock(command);

        this.intent = new CommandIntent(command.reference.intent);

        this.command = command;

        this.savedCursor = -1;
    }

    sendToREPL() {
        console.log('REPL', this.command);

        if (!this.command
            || !this.command.repl
            || !this.command.active
            || this.command.reference.completed) {
            return;
        }

        let command: string = this.intent.command;
        if (this.intent.arguments.length) {
            this.intent.arguments.map(arg => arg.content).join(" ");
        }

        this.intent.arguments = [];
        this.intent.command = "";

        this.runnerInput.nativeElement.focus();

        let type: CommandRuntime = CommandRuntime.get(this.command.reference.intent.command);

        console.log('REPL-CMD', this.command.reference.id, type, command);

        this.system.send('command-repl', this.command.reference.id, type, command)

    }

    execute() {
        console.log('EXECUTE', this.intent, this.command);

        if (!this.intent.command.trim()) {
            return;
        }


        this.savedIntent = null;
        this.savedReplIntent = null;

        this.commandList.scrollToTop();
        this.commandService.resetNavigation();

        const intent: CommandIntent = new CommandIntent(this.intent);

        this.command = this.commandService.execute(intent);

        this.intent.arguments = [];
        this.intent.command = "";

        this.runnerInput.nativeElement.focus();

        BrowserStore.rollingCollectionAppend(
            Command.STORAGE_KEY,
            Command.STORAGE_LIMIT,
            new CommandIntent(intent)
        ).catch(err => {
            console.error('Could not save command to local storage');
            console.error(err);
        });
    }


}