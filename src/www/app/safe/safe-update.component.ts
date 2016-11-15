import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {CreateSafe} from "../shared/create-safe";
import {matchesValidator} from "../shared/validation";

const {ipcRenderer} = require('electron');

require('./safe-update.component.scss');

@Component({
    selector: 'up-safe-update',
    templateUrl: 'safe-update.component.html'
})
export class SafeUpdateComponent implements OnInit {

    private model:CreateSafe;
    private updateSafeForm: FormGroup;
    private submitted:boolean;

    constructor(private fb: FormBuilder) {
    }

    ngOnInit() {

        this.model = new CreateSafe();
        this.model.password = '';
        this.model.passwordConfirm = '';

        this.buildForm();
    }

    buildForm() {
        this.updateSafeForm = this.fb.group({
            'password': [this.model.password, [
                Validators.required,
                Validators.minLength(4),
                matchesValidator(() => this.updateSafeForm, 'passwordConfirm', true)
            ]],
            'passwordConfirm': [this.model.passwordConfirm, [
                Validators.required,
                matchesValidator(() => this.updateSafeForm, 'password')
            ]]
        });

        this.updateSafeForm.valueChanges.subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    onValueChanged(data?: any) {
        if (!this.updateSafeForm) { return; }
        const form = this.updateSafeForm;
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

    formErrors = {
        'password': '',
        'passwordConfirm': ''
    };

    validationMessages = {
        'password': {
            'required':      'Password is required',
            'minlength':     'Password must have at least 4 characters',
        },
        'passwordConfirm': {
            'required': 'Confirm password',
            'validateMatches': 'Password does not match'
        }
    };

    main() {
        ipcRenderer.send('safe-main');
    }

    onSubmit() {
        if(!this.updateSafeForm.valid || this.submitted) {
            return;
        }
        this.model = this.updateSafeForm.value;
        this.submitted = true;

        ipcRenderer.send('safe-update', this.model.password);
    }

}