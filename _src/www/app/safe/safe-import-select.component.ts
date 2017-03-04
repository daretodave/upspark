import {Component, OnInit, NgZone, AfterViewInit} from "@angular/core";
import {KeyValueService} from "../shared/key-value.service";
import {KeyValueOption} from "../shared/key-value-option";
import {FormGroup, Validators, FormBuilder} from "@angular/forms";
import {CreateSafe} from "../shared/create-safe";
import {matchesValidator} from "../shared/validation";
import {KeyValue} from "../shared/key-value";

const {ipcRenderer} = require('electron');

require('./safe-import-select.component.scss');

@Component({
    selector: 'up-safe-import-select',
    templateUrl: 'safe-import-select.component.html'
})
export class SafeImportSelectComponent implements OnInit {

    private values: KeyValueOption[];
    private importCount:number = 0;
    private overwriteCount:number = 0;
    private submitted:boolean;

    ngOnInit() {
        this.values = [];

        this.service.toImport.forEach((value) => {
            let option: KeyValueOption = new KeyValueOption();
            option.key = value.key;
            option.value = value.value;
            option.selected = false;

            this.values.push(option);
        });

    }

    recalc() {
        let importCount:number = 0;
        let overwriteCount:number = 0;

        this.values.forEach((value) => {
           if(value.selected) {
               importCount++;
               this.service.data.forEach((existingValue) => {
                   if(existingValue.key === value.key) {
                       overwriteCount++;
                   }
               });
           }
        });

        this.importCount = importCount;
        this.overwriteCount = overwriteCount;
    }

    selectAll(selected:boolean) {
        this.values.forEach((value) => {
            value.selected = selected;
        });
        this.recalc();
    }

    toggle(value:KeyValueOption) {
        value.selected = !value.selected;

        this.recalc();
    }

    constructor(private service:KeyValueService) {
    }

    main() {
        ipcRenderer.send('safe-main');
    }

    next() {
        if(this.importCount === 0 || this.submitted) {
            return 0;
        }
        let toImport:KeyValue[] = [];
        this.values.forEach((value) => {
           if(value.selected) {
               toImport.push(value);
           }
        });

        ipcRenderer.send('safe-import-final', toImport);
    }

}