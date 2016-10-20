import {RunnerRoutingModule} from './runner-routing.module';
import {CommonModule} from "@angular/common";
import {RunnerComponent} from "./runner.component";
import {NgModule} from "@angular/core";
import {RunnerBasicComponent} from "./runner-basic.component";
import {RunnerSplitComponent} from "./runner-split.component";

@NgModule({
    imports: [
        CommonModule,
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