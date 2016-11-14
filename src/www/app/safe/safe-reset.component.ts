import {Component} from "@angular/core";
import {Router} from "@angular/router";

require('./safe-reset.component.scss');

const {ipcRenderer} = require('electron');

@Component({
    selector: 'up-safe-reset',
    templateUrl: 'safe-reset.component.html'
})
export class SafeResetComponent {

    private submitted:boolean;

    constructor(private router:Router) {
    }

    back() {
        this.router.navigate(['/safe/auth']);
    }

    reset() {
        if(this.submitted) {
            return;
        }
        this.submitted = true;

        ipcRenderer.send('safe-reset');
    }

}