const fs = require('fs');
const path = require('path');

export class Safe {

    public created:boolean = false;
    public file:string;

    constructor(public root: string) {
        this.file = path.join(root, 'SAFE');
        this.created = fs.existsSync(this.file);
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

}