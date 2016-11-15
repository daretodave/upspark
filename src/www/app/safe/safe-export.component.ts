import {Component, OnInit, NgZone} from "@angular/core";
import {KeyValueService} from "../shared/key-value.service";
import {KeyValueOption} from "../shared/key-value-option";
import {FormGroup, Validators, FormBuilder} from "@angular/forms";
import {CreateSafe} from "../shared/create-safe";
import {matchesValidator} from "../shared/validation";

const {ipcRenderer} = require('electron');

require('./safe-export.component.scss');

@Component({
    selector: 'up-safe-export',
    templateUrl: 'safe-export.component.html'
})
export class SafeExportComponent implements OnInit {

    private values: KeyValueOption[];
    private exportCount:number = 0;
    private exportLocation:string = '';
    private passwordForm:FormGroup;
    private model:CreateSafe;
    private submitted:boolean;

    ngOnInit() {
        this.values = [];

        this.model = new CreateSafe();
        this.model.password = '';
        this.model.passwordConfirm = '';

        this.service.data.forEach((value) => {
            let option: KeyValueOption = new KeyValueOption();
            option.key = value.key;
            option.value = value.value;
            option.selected = false;

            this.values.push(option);
        });

        ipcRenderer.on('safe-export-select', (event:any, location:string) => {
            console.log(location);
           this.zone.run(() => {
              this.exportLocation = location;
           });
        });

        this.buildForm();
    }

    buildForm() {
        this.passwordForm = this.fb.group({
            'password': [this.model.password, [
                Validators.required,
                Validators.minLength(4),
                matchesValidator(() => this.passwordForm, 'passwordConfirm', true)
            ]],
            'passwordConfirm': [this.model.passwordConfirm, [
                Validators.required,
                matchesValidator(() => this.passwordForm, 'password')
            ]]
        });

        this.passwordForm.valueChanges.subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    onValueChanged(data?: any) {
        if (!this.passwordForm) { return; }
        const form = this.passwordForm;
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

    recalc() {
        let exportCount:number = 0;
        this.values.forEach((value) => {
           if(value.selected) {
               exportCount++;
           }
        });

        this.exportCount = exportCount;
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

    selectFileLocation() {
        ipcRenderer.send('safe-export-select');
    }

    constructor(private zone:NgZone, private service:KeyValueService, private fb: FormBuilder) {
    }

    main() {
        ipcRenderer.send('safe-main');
    }

    onSubmit() {
        if(!this.passwordForm.valid || this.submitted || !this.exportLocation || this.exportCount === 0) {
            return;
        }
        this.model = this.passwordForm.value;
        this.submitted = true;

        let options:string[] = [];
        this.values.forEach((value) => {
            if(value.selected) {
                options.push(value.key);
            }
        });

        ipcRenderer.send('safe-export', this.model.password, this.exportLocation, options);
    }

}