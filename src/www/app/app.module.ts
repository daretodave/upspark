// Angular
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
// Modules
import {AppRoutingModule} from "./app-routing.module";
import {SettingsModule} from "./settings/settings.module";
import {RunnerModule} from "./runner/runner.module";


@NgModule({
    imports: [
        BrowserModule,
        SettingsModule,
        //RunnerModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}