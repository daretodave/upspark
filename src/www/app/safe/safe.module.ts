import {SettingsRoutingModule} from './safe-routing.module';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SafeComponent} from "./safe.component";
import {NgModule} from "@angular/core";
import {SafeMainComponent} from "./sefe-main.component";
import {SafeExportComponent} from "./safe-export.component";
import {SafeImportComponent} from "./safe-import.component";
import {SafeAuthComponent} from "./safe-auth.component";
import {SafeCreateComponent} from "./safe-create.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SettingsRoutingModule
    ],
    declarations: [
        SafeComponent,
        SafeMainComponent,
        SafeExportComponent,
        SafeImportComponent,
        SafeAuthComponent,
        SafeCreateComponent
    ],
    providers: [
    ]
})
export class SafeModule {}