import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
const rp = require('request-promise');
export class NetComms extends PlatformCommsHandler {

    constructor(host: Host) {
        super(host, 'Net');
    }

    init() {
        this.add('post', NetComms.post, {
            'url': 'The URL to perform a POST on',
            'form': 'Form payload to encode in to request',
            'headers': 'Header payload to encode in to request '
        });

    }

    static get(host:Host,
        {uri, options, headers}: any,
         resolve: (message?: any) => any,
         reject: (message?: string, syntax?: boolean) => any) {

        if(!uri) {
            reject('No URI provided', true);
            return;
        }

        options = options || {};

        rp(uri, options)
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
            url, form, headers
        })
        .then((result:any) => resolve(result))
        .catch((error:any) => reject(error))
    }

}