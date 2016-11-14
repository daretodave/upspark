import {SafeRoutingModule} from './safe-routing.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SafeComponent} from "./safe.component";
import {NgModule} from "@angular/core";
import {SafeMainComponent} from "./safe-main.component";
import {SafeExportComponent} from "./safe-export.component";
import {SafeImportComponent} from "./safe-import.component";
import {SafeAuthComponent} from "./safe-auth.component";
import {SafeCreateComponent} from "./safe-create.component";
import {SafeResetComponent} from "./safe-reset.component";
import {SafeEditComponent} from "./safe-edit.component";
import {SafeNewComponent} from "./safe-new.component";
import {SafeUpdateComponent} from "./safe-update.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SafeRoutingModule
    ],
    declarations: [
        SafeComponent,
        SafeMainComponent,
        SafeExportComponent,
        SafeImportComponent,
        SafeAuthComponent,
        SafeCreateComponent,
        SafeResetComponent,
        SafeEditComponent,
        SafeNewComponent,
        SafeUpdateComponent
    ],
    providers: [
    ]
})
export class SafeModule {}