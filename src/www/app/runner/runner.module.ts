import {RunnerRoutingModule} from "./runner-routing.module";
import {CommonModule} from "@angular/common";
import {RunnerComponent} from "./runner.component";
import {NgModule} from "@angular/core";
import {RunnerBasicComponent} from "./runner-basic.component";
import {RunnerSplitComponent} from "./runner-split.component";
import {FormsModule} from "@angular/forms";
import {SystemService} from "../shared/system/system.service";
import {CommandModule} from "./command/command.module";
import {CommandService} from "./command/command.service";
import {CommandSortPipe} from "./command/command-sort.pipe";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CommandModule,
        RunnerRoutingModule
    ],
    declarations: [
        RunnerComponent,
        RunnerBasicComponent,
        RunnerSplitComponent
    ],
    providers: [
        SystemService,
        CommandService,
        CommandSortPipe
    ]
})
export class RunnerModule {}