export class LogMessage {

    constructor(
        public message:string,
        public error: boolean = false,
        public plain: boolean = false,
        public date: Date = new Date(),
        public indent:number = 0) {
    }


}