import {Component, OnInit} from "@angular/core";
import {SystemService} from "../shared/system/system.service";
import {SystemEvent} from "../shared/system/system-event";

require('./alert.component.scss');

@Component({
    selector: 'up-alert',
    templateUrl: 'alert.component.html'
})
export class AlertComponent implements OnInit {

    private error:string = 'Please open the log for error details...';

    constructor(private system: SystemService) {
    }

    ngOnInit() {
        console.log('SUBSCRIBING TO SYSTEM EVENT');

        this.system.subscribeToBroadcast('alert-error', (event:SystemEvent) => {
            console.log('ERROR', event);

            this.error = event.value;
        }, true);
    }

    openLog() {
        this.system.send('alert-log');
    }

}