import {PlatformCommsAction} from "./platform-comms-action";
import {Host} from "../../model/host";
export interface PlatformCommsPlan {
    handler:PlatformCommsAction,
    example:string,
    title:string
}
export abstract class PlatformCommsHandler {

    private handlers:Map<string, PlatformCommsPlan>;
    private title:string;
    private host:Host;

    constructor(host:Host, title:string) {
        this.handlers = new Map<string, PlatformCommsPlan>();
        this.title = title;
        this.host = host;

        this.init();
    }

    static method(args:any, ...chain:string[]):string {
        let methodText:string = '';

        methodText += `<div class="method-signature"><span class="method-chain">${chain.join(`</span>.<span class="method-chain">`)}</span>`
        methodText += `<span class="method-bracket">(</span></div>`

        for(let arg in args) {
            methodText += '<div>';
            methodText += `    <div class='col-xs-3'>`;
            methodText += `        <div class='method-arg'>`;
            methodText += `            ${arg}`;
            methodText += `        </div>`;
            methodText += `    </div>`;
            methodText += `    <div class='col-xs-8'>`;
            methodText += `        <div class='method-comment'>`;
            methodText += `            /* ${args[arg]} */`;
            methodText += `        </div>`;
            methodText += `    </div>`;
            methodText += '</div>';
        }

        methodText += `<div class="clearfix"></div><span class="method-bracket">)</span><span class="method-semicolon">;</span>`

        return methodText;
    }

    add(key:string, handler:PlatformCommsAction, example?:string|any) {
        if(!(typeof example === 'string')) {
            example = PlatformCommsHandler.method(example, this.title, key);
        }

        this.handlers.set(key.toUpperCase(), {
            handler:handler,
            example:example,
            title: key,
        });
    }

    handle(
        action:string,
        parameters:any,
        resolve:(message?:string) => any,
        reject:(message?:string) => any) {

        if(!this.handlers.has(action)) {
            reject(`${action} not found in the '${this.title}' handler`);
            return;
        }

        let plan:PlatformCommsPlan = this.handlers.get(action);

        try {
            let response = plan.handler(
                this.host,
                parameters,
                resolve,
                (message?:string,syntax:boolean = false) => {
                    message = `${this.title}.${plan.title}<br><hr><span class="error-subtext">${message}</span>`;
                    if (syntax && plan.example) {
                        message += `<hr>`;
                        message += `${plan.example}`;
                    }

                    reject(message);
                }
            );
            if (typeof response !== 'undefined') {
                resolve(response);
            }

        } catch(err) {
            reject(err.message);
        }
    }

    abstract init() : any;

}