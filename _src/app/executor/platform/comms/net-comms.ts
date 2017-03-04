import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
const rp = require('request-promise');
export class NetComms extends PlatformCommsHandler {

    constructor(host: Host) {
        super(host, 'Net');
    }

    init() {
        this.add('post', NetComms.post, {
            'url': 'The URL to perform a POST request on',
            'form': 'Form payload to encode in to request',
            'headers': 'Header payload to encode in to request '
        });

        this.add('get', NetComms.get, {
            'url': 'The URL to perform a GET request on',
            'qs': 'The query string to append to the URL',
            'headers': 'Header payload to encode in to request '
        });

        this.add('request', NetComms.get, {
            'options': 'Options to perform a HTTP call with the request API',
        });
    }

    static request(host:Host,
               options: any,
               resolve: (message?: any) => any,
               reject: (message?: string, syntax?: boolean) => any) {

        if(!options) {
            reject('No options provided', true);
            return;
        }

        rp(options)
            .then((result:any) => resolve(result))
            .catch((error:any) => reject(error))
    }

    static get(host:Host,
        {url, qs, headers}: any,
         resolve: (message?: any) => any,
         reject: (message?: string, syntax?: boolean) => any) {

        if(!url) {
            reject('No URI provided', true);
            return;
        }

        qs = qs || {};
        headers = headers || {};

        rp({url, qs, headers, simple: false })
        .then((result:any) => resolve(result))
        .catch((error:any) => reject(error))
    }

    static post(host:Host,
        {url, form, headers}: any,
         resolve: (message?: any) => any,
         reject: (message?: string, syntax?: boolean) => any) {

        if(!url) {
            reject('No URI provided', true);
            return;
        }

        form = form || {};
        headers = headers || {};

        rp({
            method: 'POST',
            url, form, headers,
            simple: false
        })
        .then((result:any) => resolve(result))
        .catch((error:any) => reject(error))
    }

}