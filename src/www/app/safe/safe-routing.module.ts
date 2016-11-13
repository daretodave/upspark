import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {SafeComponent} from "./safe.component";
import {SafeMainComponent} from "./sefe-main.component";
import {SafeExportComponent} from "./safe-export.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'safe',
                component: SafeComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'main',
                        pathMatch: 'full'
                    },
                    {
                        path: 'main',
                        component: SafeMainComponent
                    },
                    {
                        path: 'export',
                        component: SafeExportComponent
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