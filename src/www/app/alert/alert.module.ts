import {AlertRoutingModule} from "./alert-routing.module";
import {CommonModule} from "@angular/common";
import {AlertComponent} from "./alert.component";
import {NgModule} from "@angular/core";

@NgModule({
    imports: [
        CommonModule,
        AlertRoutingModule
    ],
    declarations: [
        AlertComponent,
    ],
    providers: [
    ]
})
export class AlertModule {}