export class SystemEvent {

    constructor(private attachment:Map<string, any>, public event:any) {
    }

    get<T>(property:string, fallback?:T): T {
        if(!this.attachment.has(property)) {
            return fallback;
        }
        return this.attachment.get(property);
    }

}