// Angular
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
// Modules
import {SettingsModule} from "./settings/settings.module";
import {RunnerModule} from "./runner/runner.module";
import {RouterModule} from "@angular/router";


@NgModule({
    imports: [
        BrowserModule,
        SettingsModule,
        RunnerModule,
        RouterModule.forRoot([], {
            useHash: true            
        })
    ],
    
    declarations: [
        AppComponent
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}