import {SettingsRoutingModule} from './settings-routing.module';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SettingsComponent} from "./settings.component";
import {NgModule} from "@angular/core";
import {SettingsGeneralComponent} from "./settings-general.component";
import {SettingsAppearanceComponent} from "./settings-appearance.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SettingsRoutingModule
    ],
    declarations: [
        SettingsComponent,
        SettingsGeneralComponent,
        SettingsAppearanceComponent
    ],
    providers: [
    ]
})
export class SettingsModule {}