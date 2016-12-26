import {Command} from "./command";
export class CommandUpdate extends Command {

    constructor(
        id:number,
        public messages:string[] = [],
        public errors:string[] = []
    ) {
        super(id, null);

        Object.keys(this).forEach((property:string) => {
            if(!this.hasOwnProperty(property)
                || property == 'errors'
                || property == 'messages') {
                return;
            }

            this[property] = undefined;
        });
    }

}