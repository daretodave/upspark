import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {SettingsComponent} from "./settings.component";
import {SettingsGeneralComponent} from "./settings-general.component";
import {SettingsAppearanceComponent} from "./settings-appearance.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                redirectTo: 'settings',
                pathMatch: 'full'
            },
            {
                path: 'settings',
                component: SettingsComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'general',
                        pathMatch: 'full'
                    },
                    {
                        path: 'general',
                        component: SettingsGeneralComponent
                    },
                    {
                        path: 'appearance',
                        component: SettingsAppearanceComponent
                    }
                ]
            },
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class SettingsRoutingModule { }