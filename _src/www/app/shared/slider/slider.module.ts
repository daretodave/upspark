
import {SliderComponent} from "./slider.component";
import {SliderBallComponent} from "./slider-ball.component";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        SliderBallComponent,
        SliderComponent
    ],
    exports: [
        SliderBallComponent,
        SliderComponent
    ],
    providers: [
    ]
})
export class SliderModule {}