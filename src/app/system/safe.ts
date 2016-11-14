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

    reset(): Promise<boolean> {
        let self:Safe = this;
        let executor = (resolve: (value?: boolean | PromiseLike<boolean>) => void, reject: (reason?: any) => void) => {
            fs.unlink(this.file, function(error: NodeJS.ErrnoException){
                if(error !== null) {
                    reject(error);
                    return;
                }

                self.password = null;
                self.auth = false;
                self.created = false;

                resolve(true);

            });
        };
        return new Promise<boolean>(executor);
    }

    unlock(password:string): Promise<any> {
        let self:Safe = this;
        let executor = (resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => {
            fs.readFile(this.file, 'utf8', (err: NodeJS.ErrnoException, data: string) => {
                if(err != null) {
                    reject(err);
                    return;
                }
                try {
                    let decipher = crypto.createDecipher(self.algorithm, password);
                    let dec:string = decipher.update(data, 'hex', 'utf8');
                    dec += decipher.final('utf8');

                    if(!dec.startsWith('upspark:')) {
                        reject();
                        return;
                    }

                    self.vault = new Map<string, string>();
                    self.auth = true;
                    self.password = password;

                    let blocks: string[] = dec.split(":");
                    let mappings: any = {};

                    if(blocks.length > 2) {
                        for(let i = 1, length = blocks.length; i < length; i += 2) {
                            let key   = blocks[i];
                            let value = blocks[i+1];

                            self.vault.set(key, value);

                            mappings[key] = value;
                        }
                    }

                    resolve(mappings);
                } catch (error) {
                    reject(error);
                }
            });

        };
        return new Promise<boolean>(executor);
    }

    private save(): Promise<boolean> {
        let self:Safe = this;
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

                self.auth = true;
                self.created = true;

                resolve(true);
            });
        };
        return new Promise<boolean>(executor);
    }

    build(password: string): Promise<boolean> {

        this.password = password;

        return this.save();
    }

    lock() {
        this.password = '';
        this.auth = false;
        this.vault = new Map<string, string>();
    }
}