import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {SplashComponent} from "./splash.component";

@NgModule({
    imports: [
        RouterModule.forChild([{
            path: 'splash',
            component: SplashComponent
        }])
    ],
    exports: [
        RouterModule
    ]
})
export class SplashRoutingModule {
}