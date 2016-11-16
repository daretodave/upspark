import {Component, OnInit, NgZone, AfterViewInit} from '@angular/core';
import {KeyValue} from "../shared/key-value";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {restrictValidator} from "../shared/validation";

const {ipcRenderer} = require('electron');

require('./safe-new.component.scss');

@Component({
    selector: 'up-safe-new',
    templateUrl: 'safe-new.component.html'
})
export class SafeNewComponent implements OnInit, AfterViewInit {

    ngAfterViewInit() {
        ipcRenderer.removeAllListeners('safe-new-error');

        let self:SafeNewComponent = this;

        ipcRenderer.on('safe-new-error', (event:any, field:string, error:string) => {
            self.zone.run(() => {
                self.formErrors[field] = error;
                self.submitted = false;
            });

        });
    }

    private model:KeyValue;
    private createValueForm: FormGroup;
    private submitted:boolean;

    constructor(private fb: FormBuilder, private zone: NgZone) {
    }

    ngOnInit() {

        this.model = new KeyValue();
        this.model.key = '';
        this.model.value = '';

        this.buildForm();


    }

    buildForm() {
        this.createValueForm = this.fb.group({
            'key': [this.model.key, [
                Validators.required,
                restrictValidator(':')
            ]],
            'value': [this.model.value, [
                Validators.required,
                restrictValidator(':')
            ]]
        });

        this.createValueForm.valueChanges.subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
    }

    formErrors = {
        'key': '',
        'value': ''
    };

    validationMessages = {
        'key': {
            'required':      'The key is required',
            'validateRestricted': 'Data in the safe can not have a \':\' character',
        },
        'value': {
            'required': 'The value is required',
            'validateRestricted': 'Data in the safe can not have a \':\' character'
        }
    };

    onSubmit() {
        if(!this.createValueForm.valid && !this.submitted) {
            return;
        }
        this.model = this.createValueForm.value;
        this.submitted = true;

        ipcRenderer.send('safe-new', this.model.key, this.model.value);
    }

    onValueChanged(data?: any) {
        if (!this.createValueForm) { return; }
        const form = this.createValueForm;
        for (const field in this.formErrors) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    main() {
        ipcRenderer.send('safe-main');
    }

}