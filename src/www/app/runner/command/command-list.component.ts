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

        let action:boolean = false;
        let commands:Command[] = _.sortBy(this.commands, 'update');

        for(let i = 0, length = commands.length; i < length; i++) {
            let command:Command = commands[i];
            if (command.stale || action) {
                continue;
            }

            if(command.hover || command.lastInteraction === -1) {
                command.lastInteraction = tick;
                continue;
            }

            if((tick - command.lastInteraction) < 5) {
                continue;
            }

            action = true;
            command.stale = true;
        }
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