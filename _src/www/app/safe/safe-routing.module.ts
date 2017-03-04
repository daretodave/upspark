import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {SafeComponent} from "./safe.component";
import {SafeMainComponent} from "./safe-main.component";
import {SafeExportComponent} from "./safe-export.component";
import {SafeImportComponent} from "./safe-import.component";
import {SafeAuthComponent} from "./safe-auth.component";
import {SafeCreateComponent} from "./safe-create.component";
import {SafeResetComponent} from "./safe-reset.component";
import {SafeEditComponent} from "./safe-edit.component";
import {SafeUpdateComponent} from "./safe-update.component";
import {SafeNewComponent} from "./safe-new.component";
import {SafeImportSelectComponent} from "./safe-import-select.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'safe',
                component: SafeComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'auth',
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
                        path: 'reset',
                        component: SafeResetComponent
                    },
                    {
                        path: 'import',
                        component: SafeImportComponent
                    },
                    {
                        path: 'edit',
                        component: SafeEditComponent
                    },
                    {
                        path: 'import-select',
                        component: SafeImportSelectComponent
                    },
                    {
                        path: 'update',
                        component: SafeUpdateComponent
                    },
                    {
                        path: 'new',
                        component: SafeNewComponent
                    }
                ]
            },
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class SafeRoutingModule { }