import {SystemEvent} from "./system-event";
import {Injectable, NgZone} from "@angular/core";

const {ipcRenderer} = require('electron');

@Injectable()
export class SystemService {

    constructor(private _ngZone:NgZone) {
    }

    public send(message:string, ...args:any[]) {
        args.unshift(message);
        ipcRenderer.send.apply(null, args)
    }

    public subscribeToBroadcast(message:string, listener: (event: SystemEvent) => any, arg?: (string|boolean), ...args:string[]) {
        const self:SystemService = this;

        let zoned:boolean = false;
        if (arg !== null) {
            if((typeof arg) !== 'string') {
                zoned = !!arg;
            } else {
                args.unshift(<string>arg);
            }
        }

        ipcRenderer.removeAllListeners(message);
        ipcRenderer.on(message, function(ipcEvent:any) {
            const contents:any[] = Array.from(arguments);
            const attachment:Map<string, any> = new Map<string, any>();

            args.forEach((arg:string, index:number) => {
                 if(index > contents.length) {
                     return;
                 }

                 attachment.set(arg, contents[index+1]);
            });

            let event:SystemEvent = new SystemEvent(attachment, ipcEvent, contents.length > 1 ? contents[1] : null);
            if(zoned) {
                self._ngZone.run(() => listener(event))
            } else {
                listener(event);
            }

        });
    }

    public handleStyleBroadcast(...event:string[]) {
        event.forEach((message) => {
            this.subscribeToBroadcast(message, (styleUpdate:SystemEvent) => {
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