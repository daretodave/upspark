import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {CommandService} from "./command.service";
import {CommandListComponent} from "./command-list.component";
import {CommandComponent} from "./command.component";
import {CommandSortPipe} from "./command-sort.pipe";


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        CommandListComponent,
        CommandComponent,
        CommandSortPipe
    ],
    exports: [
        CommandListComponent,
        CommandComponent,
    ],
    providers: [
        CommandService,
        CommandSortPipe
    ]
})
export class CommandModule {}