import {Component, Input, HostListener, trigger, transition, style, animate} from "@angular/core";
import {Command} from "./command";

require('./command.component.scss');

@Component({
    selector: 'up-command',
    templateUrl: 'command.component.html',
    animations: [
        trigger('slide', [
            transition('void => *', [
                style({transform: 'translateX(-100px)', "margin-right": '-100px'}),
                animate(100, style({transform: 'translateX(0)', "margin-right": '*'}))
            ]),
            transition('* => void', [
                style({transform: 'translateX(0)', "margin-right": '*'}),
                animate(100, style({transform: 'translateX(-100px)', "margin-right": '-100px'}))
            ])
        ]),
        trigger('expand', [
            transition('void => *', [
                style({width: '0', "margin-right": '0'}),
                animate(100, style({width: '*', "margin-right": '*'}))
            ]),
            transition('* => void', [
                style({width: '*', "margin-right": '*'}),
                animate(100, style({width: '0', "margin-right": '0'}))
            ])
        ])
    ]
})
export class CommandComponent {

    @Input() command: Command;

    @HostListener('mouseenter') onMouseEnter() {
        this.command.hover = true;
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.command.hover = false;
    }

}