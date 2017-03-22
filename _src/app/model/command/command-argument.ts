export class CommandArgument {

    constructor(argument?:CommandArgument | string) {
        if(argument instanceof CommandArgument) {
            this.title = argument.title;
            this.content = argument.content;
        }
        if(typeof argument === 'string') {
            this.content = argument;
        }
    }
    
    title:string = '';
    content:any = '';

    focus:boolean = false;

}