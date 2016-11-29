export class Upspark {

    public commands: Map<any, any> = new Map<string, any>();

    public on(directive:any, command:any) {
        this.commands.set(directive, command);
    }

    public get(directive:any): any {
        return this.commands.get(directive);
    }

    public run(directive:any, ...args:any[]) {
        if(!directive) {
            throw `the command argument provided was empty`;
        }
        if(!this.commands.has(directive)) {
            throw `command '${directive}' not found`;
        }
        let command: any = this.commands.get(directive);

        return command.apply(this, args);
    }

}