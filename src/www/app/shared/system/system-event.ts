export class SystemEvent {

    constructor(private attachment:Map<string, any>, public ipcEvent:any, public value:any) {
    }

    get<T>(property:string, fallback?:T): T {
        if(!this.attachment.has(property)) {
            return fallback;
        }
        return this.attachment.get(property);
    }

}