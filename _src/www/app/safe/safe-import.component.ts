import {Component, OnInit, NgZone, AfterViewInit} from '@angular/core';
import {KeyValueService} from "../shared/key-value.service";
import {KeyValue} from "../shared/key-value";
import {Router} from "@angular/router";

const {ipcRenderer} = require('electron');

require('./safe-import.component.scss');

@Component({
    selector: 'up-safe-import',
    templateUrl: 'safe-import.component.html'
})
export class SafeImportComponent implements OnInit, AfterViewInit {

    ngAfterViewInit() {
        ipcRenderer.removeAllListeners('safe-import-select');
        ipcRenderer.removeAllListeners('safe-import-error');
        ipcRenderer.removeAllListeners('safe-import');

        ipcRenderer.on('safe-import-select', (event:any, location:string) => {
            this.zone.run(() => {
                this.importLocation = location;
            });
        });
        ipcRenderer.on('safe-import-error', (event:any, error:string) => {
            this.zone.run(() => {
                this.error = error;
                this.submitted = false;
            });
        });
        ipcRenderer.on('safe-import', (event:any, values:any) => {
            let toImport: KeyValue[] = [];
            for(let key in values) {
                if(values.hasOwnProperty(key)) {
                    let value = new KeyValue();
                    value.key = key;
                    value.value = values[key];

                    toImport.push(value);
                }
            }
            this.service.toImport = toImport;

            this.router.navigate(['/safe/import-select']);
        });
    }

    private importLocation:string;
    private password:string;
    private error:string;
    private submitted:boolean;

    constructor(private zone:NgZone, private service:KeyValueService, private router:Router) {

    }

    ngOnInit(): void {
        this.importLocation = '';
        this.password = '';
    }

    main() {
        ipcRenderer.send('safe-main');
    }

    next() {
        if(!this.importLocation || !this.password || this.submitted) {
            return;
        }

        this.submitted = true;

        ipcRenderer.send('safe-import', this.importLocation, this.password);
    }

    selectFileLocation() {
        ipcRenderer.send('safe-import-select');
    }

}