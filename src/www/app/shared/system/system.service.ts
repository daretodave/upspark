import {SystemEvent} from "./system-event";
import {Injectable, NgZone} from "@angular/core";

const {ipcRenderer} = require('electron');

@Injectable()
export class SystemService {

    constructor(private zone:NgZone) {
    }

    public onMessage(message:string, listener: (event: SystemEvent) => any, ...args:string[]) {
        ipcRenderer.removeAllListeners(message);
        ipcRenderer.on(message, function(ipcEvent:any) {
            let attachment:Map<string, any> = new Map<string, any>();
            let contents:any[] = Array.from(arguments);

            args.forEach((arg:string, index:number) => {
                 if(index > contents.length) {
                     return;
                 }

                 attachment.set(arg, contents[index+1]);
            });

            let event:SystemEvent = new SystemEvent(attachment, ipcEvent);

            listener(event);
        });
    }

    public handleStyleMessage(...event:string[]) {
        event.forEach((message) => {
            this.onMessage(message, (styleUpdate:SystemEvent) => {
                let id:string = `dynamic-css-for-${message}`;
                let style = document.getElementById(id);
                if (style === null) {
                    style = document.createElement('style');
                    style.setAttribute("id", id);

                    document.head.appendChild(style);
                }
                style.innerHTML = styleUpdate.get<string>('css');

            }, 'css');
        });
    }

}