import {
    AfterViewInit, Component, Input, ElementRef, NgZone, transition, animate, style, state,
    trigger
} from "@angular/core";
import {Command} from "./command";
import {Observable} from "rxjs";
import * as _ from 'lodash';

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

    private container:JQuery;

    constructor(private element:ElementRef, private zone:NgZone) {
    }

    cleanStaleData(tick:number) {
        if(!this.commands) {
            return;
        }

        let action:number = 0;
        let commands:Command[] = _.reverse( _.sortBy(this.commands, 'update'));

        commands.forEach((command:Command) => {
            if(command.stale || !command.completed) {
                return;
            }
            if(command.hover || command.lastInteraction === -1) {
                command.lastInteraction = tick;
            } else if((tick - command.lastInteraction) >= 5) {
                if(action) {
                    command.lastInteraction = tick - (2 - action++);
                } else {
                    command.stale = true;
                    action = 1;
                }
            }
        })
    }

    scrollToTop() {
        if(!this.container.scrollTop()) {
            return;
        }

        this.container.stop().animate({
            scrollTop: 0
        }, 200, 'swing');
    }

    ngAfterViewInit() {
        this.container = $(this.element.nativeElement);

        let callback: (tick:number) => any = this.cleanStaleData.bind(this);

        Observable.timer(1000, 1000).subscribe((tick:number) => this.zone.run(() => callback(tick)));
    }



}