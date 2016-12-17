import {Command} from "./command";
export class CommandListNavigation {

    constructor(public fromCursor: number) {
    }

    public command: Command;
    public navigate: boolean = false;
    public reset: boolean = false;
    public fromHidden: boolean = false;
    public fromPristine: boolean = false;

}