import {SettingsRoutingModule} from './safe-routing.module';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SafeComponent} from "./safe.component";
import {NgModule} from "@angular/core";
import {SafeMainComponent} from "./sefe-main.component";
import {SafeExportComponent} from "./safe-export.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SettingsRoutingModule
    ],
    declarations: [
        SafeComponent,
        SafeMainComponent,
        SafeExportComponent
    ],
    providers: [
    ]
})
export class SafeModule {}