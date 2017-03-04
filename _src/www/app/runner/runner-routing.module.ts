import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {RunnerComponent} from "./runner.component";

@NgModule({
    imports: [
        RouterModule.forChild([{
            path: 'runner',
            component: RunnerComponent
        }])
    ],
    exports: [
        RouterModule
    ]
})
export class RunnerRoutingModule {
}