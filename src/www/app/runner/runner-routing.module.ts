import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {RunnerComponent} from "./runner.component";
import {RunnerBasicComponent} from "./runner-basic.component";
import {RunnerSplitComponent} from "./runner-split.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'runner',
                component: RunnerComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'basic',
                        pathMatch: 'full'
                    },
                    {
                        path: 'basic',
                        component: RunnerBasicComponent,
                    },
                    {
                        path: 'basic',
                        component: RunnerSplitComponent,
                    }
                ]
            },
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class RunnerRoutingModule { }