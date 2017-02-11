// Angular
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";

// Bootstrap CSS
require('bootstrap/dist/css/bootstrap.css');

// Modules
import {SettingsModule} from "./settings/settings.module";
import {RunnerModule} from "./runner/runner.module";
import {RouterModule} from "@angular/router";
import {SafeModule} from "./safe/safe.module";
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';

// GA
require('./util/analytics');

// Bootstrap
require('bootstrap');

@NgModule({
    imports: [
        BrowserModule,
        SettingsModule,
        SafeModule,
        RunnerModule,
        RouterModule.forRoot([], {
            useHash: true            
        }),
        Angulartics2Module.forRoot()
    ],
    providers: [
        Angulartics2GoogleAnalytics
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}