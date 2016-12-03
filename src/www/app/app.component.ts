import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import { Angulartics2, Angulartics2GoogleAnalytics } from 'angulartics2';
import {Router, NavigationEnd} from "@angular/router";
import {Location} from "@angular/common"

require("./app.component.scss");

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {

    ngOnInit() {
        document.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
        document.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    constructor(private angulartics2: Angulartics2, private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, private location:Location,private router:Router) {
    }

}