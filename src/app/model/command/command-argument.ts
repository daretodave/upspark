export class CommandArgument {

    constructor(argument:CommandArgument = null) {
        if(argument !== null) {
            this.title = argument.title;
            this.content = argument.content;
        }
    }
    
    title:string = '';
    content:any = '';

}