import {Component, AfterViewInit} from '@angular/core';
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

    constructor(private router:Router) {
    }

    ngAfterViewInit(): void {
        ipcRenderer.on('safe-auth-error', () => {
            this.submitted = false;
            this.error = true;
            this.password = '';
        });
        ipcRenderer.on('safe-auth-success', (sender:any, mappings:any) => {
            console.log(mappings);
            this.router.navigate(['/safe/main']);
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