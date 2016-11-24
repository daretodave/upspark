import {Component, AfterViewInit} from '@angular/core';
import {Router} from "@angular/router";
import {KeyValue} from "../shared/key-value";
import {KeyValueService} from "../shared/key-value.service";
import {KeyValueFilterPipe} from "../shared/key-value-filter.pipe";

const {ipcRenderer} = require('electron');

require('./safe.component.scss');

@Component({
    selector: 'up-safe',
    templateUrl: 'safe.component.html',
    providers: [KeyValueService]
})
export class SafeComponent  implements AfterViewInit {

    constructor(private router: Router, private keyValueService:KeyValueService) {
    }

    ngAfterViewInit(): void {
        ipcRenderer.removeAllListeners('safe-loader');
        ipcRenderer.removeAllListeners('safe-main');
        ipcRenderer.removeAllListeners('safe-auth');
        ipcRenderer.removeAllListeners('safe-create');
        ipcRenderer.removeAllListeners('style-safe');

        ipcRenderer.on('style-safe', (event:any, arg:string) => {

            console.log('test');
            let style = document.getElementById('safe-style');
            if (style === null) {
                style = document.createElement('style');
                style.setAttribute("id", "safe-style");

                document.head.appendChild(style);
            }

            style.innerHTML = arg;
        });
        ipcRenderer.on('safe-loader', (event:any, arg:string) => {
            let element = document.getElementById('safe-loader');
            if(arg === 'on') {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
        ipcRenderer.on('safe-main', (event:any, mappings:any) => {
            let data:KeyValue[] = [];
            for (let key in mappings) {
                if (mappings.hasOwnProperty(key)) {
                    let keyValue = new KeyValue();
                    keyValue.key = key;
                    keyValue.value = mappings[key];

                    data.push(keyValue);
                }
            }
            this.keyValueService.init = true;
            this.keyValueService.data = data;

            this.router.navigate(['/safe/main']);
        });
        ipcRenderer.on('safe-create', () => {
            this.router.navigate(['/safe/create']);
        });
        ipcRenderer.on('safe-auth', () => {
            this.router.navigate(['/safe/auth']);
        });
    }

}