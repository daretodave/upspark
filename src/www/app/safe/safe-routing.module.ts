import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {SafeComponent} from "./safe.component";
import {SafeMainComponent} from "./sefe-main.component";
import {SafeExportComponent} from "./safe-export.component";
import {SafeImportComponent} from "./safe-import.component";
import {SafeAuthComponent} from "./safe-auth.component";
import {SafeCreateComponent} from "./safe-create.component";

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
                        path: 'auth',
                        component: SafeAuthComponent
                    },
                    {
                        path: 'create',
                        component: SafeCreateComponent
                    },
                    {
                        path: 'export',
                        component: SafeExportComponent
                    },
                    {
                        path: 'import',
                        component: SafeImportComponent
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