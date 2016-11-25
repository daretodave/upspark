export class LoggerBlock {

    public init:number = new Date().getTime();

    constructor(public name:string, public sync: boolean) {
    }

}