import {RunnerRoutingModule} from "./runner-routing.module";
import {CommonModule} from "@angular/common";
import {RunnerComponent} from "./runner.component";
import {NgModule} from "@angular/core";
import {RunnerBasicComponent} from "./runner-basic.component";
import {RunnerSplitComponent} from "./runner-split.component";
import {FormsModule} from "@angular/forms";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RunnerRoutingModule
    ],
    declarations: [
        RunnerComponent,
        RunnerBasicComponent,
        RunnerSplitComponent
    ],
    providers: [
    ]
})
export class RunnerModule {}