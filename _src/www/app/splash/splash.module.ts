import {SplashRoutingModule} from "./splash-routing.module";
import {CommonModule} from "@angular/common";
import {SplashComponent} from "./splash.component";
import {NgModule} from "@angular/core";

@NgModule({
    imports: [
        CommonModule,
        SplashRoutingModule
    ],
    declarations: [
        SplashComponent,
    ],
    providers: [
    ]
})
export class SplashModule {}