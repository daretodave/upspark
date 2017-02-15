import {AlertRoutingModule} from "./alert-routing.module";
import {CommonModule} from "@angular/common";
import {AlertComponent} from "./alert.component";
import {NgModule} from "@angular/core";
import {SystemService} from "../shared/system/system.service";

@NgModule({
    imports: [
        CommonModule,
        AlertRoutingModule
    ],
    declarations: [
        AlertComponent,
    ],
    providers: [
        SystemService
    ]
})
export class AlertModule {}