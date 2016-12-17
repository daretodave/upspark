import {
    AfterViewInit, Component, Input, ElementRef, NgZone, transition, animate, style, trigger,
    ViewChild, AnimationTransitionEvent
} from "@angular/core";
import {Command} from "./command";
import {Observable} from "rxjs";
import * as _ from "lodash";
import {CommandService} from "./command.service";

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
export class CommandListComponent implements  AfterViewInit {

    @Input() commands:Command[];
    @ViewChild('commandContainer') commandContainer: ElementRef;

    private commandContainerJQuerySelector: JQuery;
    private lockedCommand:Command;

    constructor(private element:ElementRef, private commandService:CommandService, private zone:NgZone) {
    }

    cleanStaleData(tick:number) {
        if(!this.commands) {
            return;
        }

        let action:boolean = false;
        let commands:Command[] = _.sortBy(this.commands, 'update');

        for(let i = 0, length = commands.length; i < length; i++) {
            let command:Command = commands[i];

            if (command.stale || !command.completed || command.isNavigatedTo || action) {
                continue;
            }

            if(this.commandService.isNavigating()|| command.hover || command.lastInteraction === -1) {
                command.lastInteraction = tick;
                continue;
            }

            if((tick - command.lastInteraction) < 7) {
                continue;
            }

            action = command.stale = true;
        }
    }

    scroll(scrollTop:number) {
        this.commandContainerJQuerySelector.stop().animate({
            scrollTop
        }, 600);
    }

    scrollToTop() {
        this.lock(null);

        if(this.commandContainerJQuerySelector.scrollTop() === 0) {
            return;
        }

        this.scroll(0);
    }

    scrollTo(command:Command) {
        let element:JQuery = $('#command-status--' + command.id);

        let elementHeight:number = element.height();
        let elementOffset:number = element.position().top + this.commandContainerJQuerySelector.scrollTop();

        let containerHeight:number =  (<HTMLElement> this.element.nativeElement).offsetHeight;

        let scrollTop:number = elementOffset;
        if (elementHeight < containerHeight) {
            scrollTop -= containerHeight/2 - elementHeight/2;
        }

        this.scroll(scrollTop);
    }

    lock(command:Command) {
        this.lockedCommand = command;

        if(!command) {
            return;
        }

        let element:JQuery = $('#command-status--' + command.id);
        if (element.is(":visible")) {
            this.scrollTo(command);
            return;
        }

    }

    onCommandAnimationFinish(event:AnimationTransitionEvent) {
        if(event.toState !== null || this.lock === null) {
            return;
        }

        this.lock(this.lockedCommand);
    }

    ngAfterViewInit() {
        this.commandContainerJQuerySelector = $(this.commandContainer.nativeElement);

        let callback: (tick:number) => any = this.cleanStaleData.bind(this);

        Observable.timer(1000, 1000).subscribe((tick:number) => this.zone.run(() => callback(tick)));
    }



}