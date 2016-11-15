import {Component, OnInit} from '@angular/core';
import {KeyValue} from "../shared/key-value";
import {KeyValueService} from "../shared/key-value.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {restrictValidator, keyValueValidator} from "../shared/validation";

const {ipcRenderer} = require('electron');

require('./safe-edit.component.scss');

@Component({
    selector: 'up-safe-edit',
    templateUrl: 'safe-edit.component.html'
})
export class SafeEditComponent implements OnInit {

    private model:KeyValue;
    private values:KeyValue[];
    private current:KeyValue;
    private submitted:boolean;
    private editValueForm: FormGroup;

    ngOnInit() {
        this.current = this.service.edit;
        this.values = this.service.data.slice(0);

        if(this.model === null) {
            ipcRenderer.send('safe-main');
            return;
        }

        console.log(this.values);
        let idx = -1;
        this.values.forEach((value, delIdx) => {
            if(value.key === this.current.key) {
                idx = delIdx;
            }
        });
        delete this.values[idx];
        console.log(this.values, idx);

        this.model = new KeyValue();
        this.model.key = this.current.key;
        this.model.value = this.current.value;

        this.buildForm();
    }

    buildForm() {
        this.editValueForm = this.fb.group({
            'key': [this.model.key, [
                Validators.required,
                restrictValidator(':'),
                keyValueValidator(this.values)
            ]],
            'value': [this.model.value, [
                Validators.required,
                restrictValidator(':')
            ]]
        });

        this.editValueForm.valueChanges.subscribe(data => this.onValueChanged(data));

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
            'validateKeyValue': 'This key is already taken'
        },
        'value': {
            'required': 'The value is required',
            'validateRestricted': 'Data in the safe can not have a \':\' character'
        }
    };


    constructor(private service:KeyValueService, private fb: FormBuilder) {
    }

    onSubmit() {
        if(!this.editValueForm.valid && !this.submitted) {
            return;
        }
        this.model = this.editValueForm.value;
        this.submitted = true;

        ipcRenderer.send('safe-edit', this.model.key, this.current.key, this.model.value);
    }

    onValueChanged(data?: any) {
        if (!this.editValueForm) { return; }
        const form = this.editValueForm;
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