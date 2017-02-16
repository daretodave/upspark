import {Component, AfterViewInit, NgZone} from '@angular/core';
import {Router} from "@angular/router";

const {ipcRenderer} = require('electron');

require('./safe-auth.component.scss');

@Component({
    selector: 'up-safe-auth',
    templateUrl: 'safe-auth.component.html'
})
export class SafeAuthComponent implements AfterViewInit {

    private password:string;
    private submitted:boolean;
    private error:boolean;

    constructor(private router:Router, private zone: NgZone) {
    }

    ngAfterViewInit(): void {
        ipcRenderer.removeAllListeners('safe-auth-error');

        let self:SafeAuthComponent = this;
        ipcRenderer.on('safe-auth-error', () => {
            this.zone.run(() => {
                self.submitted = false;
                self.error = true;
                self.password = '';
            });
        });
    }

    auth() {
        if(this.submitted || !this.password) {
            return;
        }
        this.submitted = true;

        ipcRenderer.send('safe-auth', this.password);
    }

    reset() {
        this.router.navigate(['/safe/reset']);
    }

}