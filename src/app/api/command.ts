import {Platform} from "./platform/platform";
import {Util} from "./util";
export class Command {

    private isFunction:boolean;

    constructor(public context:string, public executor:any, public platform:Platform) {
        this.isFunction = Util.isFunction(executor);
        if(this.isFunction) {
            this.executor = executor.bind(platform);
        }

    }

    public execute: () => Promise<any> = this.resolve.bind(this);

    private resolve():Promise<any> {
        let args:any[] = Array.from(arguments);
        let executor = (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
            if(this.isFunction) {
                Promise.all([
                    this.executor.apply(this.platform, args)
                ]).then(resolve).catch(reject);
                return;
            }

            let value:any = this.executor;
            if(Array.isArray(value)) {
                Promise.all(value).then(resolve).catch(reject);
                return;
            }

            resolve(value);
        };
        return new Promise(executor);
    }


}