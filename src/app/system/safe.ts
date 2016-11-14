const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

export class Safe {

    public created:boolean = false;
    public auth:boolean = false;
    public file:string;

    private vault:Map<string, string>;
    private password:string;

    constructor(public root: string, public algorithm: string) {
        this.file = path.join(root, 'SAFE');
        this.created = fs.existsSync(this.file);
        this.vault = new Map<string, string>();
    }

    init(): Promise<boolean> {
        let executor = (resolve: (value?: boolean | PromiseLike<boolean>) => void, reject: (reason?: any) => void) => {
            fs.mkdir(this.root, 777, (error: NodeJS.ErrnoException) => {
                if(error != null && error.code !== 'EEXIST') {
                    reject(error);
                    return;
                }
                resolve();
            });
        };
        return new Promise<boolean>(executor);
    }

    private save(): Promise<boolean> {
        let executor = (resolve: (value?: boolean | PromiseLike<boolean>) => void, reject: (reason?: any) => void) => {
            let contents = 'upspark:';
            this.vault.forEach((value:string, key:string) => {
                contents += key;
                contents += ':';
                contents += value;
            });
            let cipher  = crypto.createCipher(this.algorithm, this.password);
            let crypted = cipher.update(contents, 'utf8','hex');

            crypted += cipher.final('hex');

            fs.writeFile(this.file, crypted, (err: NodeJS.ErrnoException) => {
                if(err !== null) {
                    reject(err);
                    return;
                }

                this.auth = true;
                this.created = true;

                resolve(true);
            });
        };
        return new Promise<boolean>(executor);
    }

    build(sender: any, password: string, window: any): Promise<boolean> {
        sender.send('safe-loader', 'on');

        this.password = password;

        return this.save()
          .then(() => {
            sender.send('safe-loader', 'off');
            return true;
        }).catch((e) => {
            console.log(e);
            sender.send('safe-loader', 'off');
            return false;
        });
    }
}