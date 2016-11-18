import {SettingsRoutingModule} from './settings-routing.module';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SettingsComponent} from "./settings.component";
import {NgModule} from "@angular/core";
import {SettingsGeneralComponent} from "./settings-general.component";
import {SettingsAppearanceComponent} from "./settings-appearance.component";
import {SettingsAboutComponent} from "./settings-about.component";
import {SettingsService} from "./settings.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SettingsRoutingModule
    ],
    declarations: [
        SettingsComponent,
        SettingsGeneralComponent,
        SettingsAppearanceComponent,
        SettingsAboutComponent
    ],
    providers: [
        SettingsService
    ]
})
export class SettingsModule {}