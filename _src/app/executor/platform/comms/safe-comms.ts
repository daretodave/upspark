import {PlatformCommsHandler} from "../platform-comms-handler";
import {Host} from "../../../model/host";
export class SafeComms extends PlatformCommsHandler {

    constructor(host:Host) {
        super(host, 'Safe');
    }

    init() {
        this.add('get', SafeComms.getSafeValue, {
            'key': `safe value's key`
        });
        this.add('isUnlocked', SafeComms.isUnlocked);
        this.add('unlock', SafeComms.unlock, {
            'password': `password used for encryption`
        });
        this.add('lock', SafeComms.lock);
    }

    static lock(host:Host) {
        host.safe().lock();
        host.sendSafeMessage('safe-auth');

        return true;
    }

    static unlock(host:Host,
                  password:string,
                  resolve: (message?: any) => any,
                  reject: (message?: string, syntax?:boolean) => any) {
        if(!password) {
            reject(`Provide the password used to encrypt the safe.`, true);
            return;
        }
        setTimeout(() =>
            host.safe()
                .unlock(password)
                .then(() => {
                    host.sendSafeMessage('safe-main', host.safe().getMappings());

                    resolve('');
                }).catch(() => {
                    reject('Password is not correct.');
                }),
        1000);
    }

    static isUnlocked(host:Host) {
        return host.safe().auth;
    }

    static getSafeValue(host:Host,
                        key: string,
                        resolve: (message?: string) => any,
                        reject: (message?: string, syntax?:boolean) => any) {

        if(!key) {
            reject(`Provide the key argument when getting values from the safe.`, true);
            return;
        }

        if(!host.safe().auth) {
            reject('Safe is locked.');
            return;
        }

        key = key.toString();

        if(!host.safe().has(key)) {
            reject(`Key <span class="accent">${key}</span> was not found`);
            return;
        }

        resolve(host.safe().get(key));
    }

}