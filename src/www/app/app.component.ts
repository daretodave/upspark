import {Component, ViewEncapsulation} from '@angular/core';

require("./app.component.scss");

@Component({
    selector: 'app',
    template: '<router-outlet></router-outlet>',
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {

    constructor() {

    }

}