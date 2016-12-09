import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {CommandService} from "./command.service";
import {CommandListComponent} from "./command-list.component";
import {CommandComponent} from "./command.component";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        CommandListComponent,
        CommandComponent
    ],
    exports: [
        CommandListComponent,
        CommandComponent
    ],
    providers: [
        CommandService
    ]
})
export class CommandModule {}