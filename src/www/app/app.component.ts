import {Component, ViewEncapsulation} from '@angular/core';


@Component({
    selector: 'app',
    template: '<router-outlet></router-outlet>',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['app.component.scss']
})
export class AppComponent {

    constructor() {

    }

}