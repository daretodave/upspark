import {ValidatorFn, AbstractControl, FormGroup} from "@angular/forms";

export function matchesValidator(formGroup: () => FormGroup, field:string, reverse:boolean = false): ValidatorFn {

    return (control: AbstractControl): {[key: string]: any} => {
        let  group:FormGroup = formGroup();
        if( !group) {
            return null;
        }

        const theirControl = formGroup().get(field);
        if(!theirControl.value || !control.value || theirControl.value === control.value) {
            if(reverse && theirControl.hasError('validateMatches')) {
                //clear out existing error
                delete theirControl.errors['validateMatches'];
                if(!Object.keys(theirControl.errors).length) {
                    theirControl.setErrors(null);
                }
            }
            return null;
        }

        if(reverse && theirControl.value.length) {
            if(!theirControl.hasError('validateMatches')) {
                // updated the original value, mark the confirm as dirty
                theirControl.setErrors({'validateMatches': false});
            }
            return null;
        }

        return {'validateMatches': false};
    };
}

export function restrictValidator(restriction:string): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
        if(control.value.indexOf(restriction) >= 0) {
            return {'validateRestricted': false}
        }

        return null;
    };
}