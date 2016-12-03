import {Upspark} from "../upspark";
const internal: string[] = require('builtin-modules');
const tryRequire = require('try-require');

export class Platform {

    public upspark:Upspark;

    constructor(private reference:any) {
        this.upspark = new Upspark();
    }

    public require(path:string) {
        if(!internal.includes(path)) {
            throw `Could not find module ${path}`;
        }

        return tryRequire(path);
    }

}