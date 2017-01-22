import {
    Component,
    ElementRef,
    NgZone,
    transition,
    animate,
    style,
    trigger,
    ViewChild,
    AnimationTransitionEvent,
    OnInit
} from "@angular/core";
import {Observable} from "rxjs";
import {sortBy} from "lodash";
import {CommandService} from "./command.service";
import {CommandWrapper} from "./command-wrapper";

require('./command-list.component.scss');

@Component({
    selector: 'up-command-list',
    templateUrl: 'command-list.component.html',
    animations: [
        trigger('slide', [
            transition('void => *', [
                style({transform: 'translateX(-100%)'}),
                animate(200, style({transform: 'translateX(0)'}))
            ]),
            transition('* => void', [
                style({height: '*'}),
                animate(100, style({height: 0}))
            ])
        ])
    ]
})
export class CommandListComponent implements OnInit {

    private $$commandContainer: JQuery;
    private lockedCommand: CommandWrapper;
    private commands: CommandWrapper[];

    @ViewChild('commandContainer')
    private commandContainer: ElementRef;

    ngOnInit() {
        this.commands = this.commandService.getCommands();
        this.$$commandContainer = $(this.commandContainer.nativeElement);

        let callback: (tick: number) => any = this.cleanStaleData.bind(this);

        Observable
            .timer(1000, 1000)
            .subscribe(
                (tick: number) => this.zone.run(
                    () => callback(tick))
            );
    }

    constructor(private element: ElementRef,
                private commandService: CommandService,
                private zone: NgZone) {

    }

    toStaleState() {
        if (!this.commands) {
            return;
        }

        this.commands.forEach((command: CommandWrapper) => {
            command.stale = true;
            command.update = -1;
        });
    }

    cleanStaleData(tick: number) {
        if (!this.commands) {
            return;
        }

        let action: boolean = false;
        let commands: CommandWrapper[] = sortBy(
            this.commands,
            (command: CommandWrapper) => command.reference.update
        );

        commands.forEach((command: CommandWrapper) => {
            if (command.isIdle() || action) {
                return;
            }

            if (this.commandService.isNavigating() || command.hover || command.update === -1) {
                command.update = tick;
                return;
            }

            if ((tick - command.update) < 7) {
                return;
            }

            action = command.stale = true;
        });
    }

    scroll(scrollTop: number) {
        this.$$commandContainer.stop().animate({
            scrollTop
        }, 600);
    }

    scrollToTop() {
        this.lock(null);

        if (this.$$commandContainer.scrollTop() === 0) {
            return;
        }

        this.scroll(0);
    }

    scrollTo(element: JQuery) {

        let elementHeight: number = element.height();
        let elementOffset: number = element.position().top + this.$$commandContainer.scrollTop();

        let containerHeight: number = (<HTMLElement> this.element.nativeElement).offsetHeight;

        let scrollTop: number = elementOffset;
        if (elementHeight < containerHeight) {
            scrollTop -= containerHeight / 2 - elementHeight / 2;
        }

        this.scroll(scrollTop);
    }

    lock(command: CommandWrapper) {
        this.lockedCommand = command;

        if (!command) {
            return;
        }

        let element: JQuery = $('#command-status--' + command.reference.id);
        if (element.is(":visible")) {
            this.scrollTo(element);
            return;
        }

    }

    onCommandAnimationFinish(event: AnimationTransitionEvent) {
        if (event.toState !== null || this.lock === null) {
            return;
        }

        this.lock(this.lockedCommand);
    }

}