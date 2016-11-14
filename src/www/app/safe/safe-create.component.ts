import {Component, OnInit} from '@angular/core';
import {CreateSafe} from "../shared/create-safe";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {matchesValidator} from "../shared/validation";

const {ipcRenderer} = require('electron');

require('./safe-create.component.scss');

@Component({
    selector: 'up-safe-create',
    templateUrl: 'safe-create.component.html'
})
export class SafeCreateComponent implements OnInit {

    private model:CreateSafe;
    private createSafeForm: FormGroup;
    private submitted:boolean;

    constructor(private fb: FormBuilder) {
    }

    ngOnInit(): void {

        this.model = new CreateSafe();
        this.model.password = '';
        this.model.passwordConfirm = '';

        this.buildForm();


    }

    buildForm() {
        this.createSafeForm = this.fb.group({
            'password': [this.model.password, [
                Validators.required,
                Validators.minLength(4),
                matchesValidator(() => this.createSafeForm, 'passwordConfirm', true)
            ]],
            'passwordConfirm': [this.model.passwordConfirm, [
                Validators.required,
                matchesValidator(() => this.createSafeForm, 'password')
            ]]
        });
        this.createSafeForm.valueChanges.subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
    }

    onValueChanged(data?: any) {
        if (!this.createSafeForm) { return; }
        const form = this.createSafeForm;
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

    onSubmit() {
        if(!this.createSafeForm.valid && !this.submitted) {
            return;
        }
        this.model = this.createSafeForm.value;
        this.submitted = true;

        ipcRenderer.send('safe-create', this.model.password);
    }

}