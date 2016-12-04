export class CommandResponse {

    public debug:string;
    public error:boolean;

    static error(err: any): CommandResponse {
        let response:CommandResponse = new CommandResponse();
        response.error = true;
        response.debug = err;

        return response;
    }
}