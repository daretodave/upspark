import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {AlertComponent} from "./alert.component";

@NgModule({
    imports: [
        RouterModule.forChild([{
            path: 'alert',
            component: AlertComponent
        }])
    ],
    exports: [
        RouterModule
    ]
})
export class AlertRoutingModule {
}