import {Component, AfterViewInit} from '@angular/core';
import {Router} from "@angular/router";

const {ipcRenderer} = require('electron');

require('./safe.component.scss');

@Component({
    selector: 'up-safe',
    templateUrl: 'safe.component.html'
})
export class SafeComponent  implements AfterViewInit {

    constructor(private router: Router) {
    }

    ngAfterViewInit(): void {
        ipcRenderer.on('safe-loader', (event:any, arg:string) => {
            let element = document.getElementById('safe-loader');
            if(arg === 'on') {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
        ipcRenderer.on('safe-main', () => {
            this.router.navigate(['/safe/main']);
        });
    }

}