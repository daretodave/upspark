import { Component } from '@angular/core';
import {Router} from "@angular/router";

require('./safe-auth.component.scss');

@Component({
    selector: 'up-safe-auth',
    templateUrl: 'safe-auth.component.html'
})
export class SafeAuthComponent {

    private password:string;

    constructor(private router:Router) {
        this.password = '';
    }

    reset() {
        this.router.navigate(['/safe/reset']);
    }

}