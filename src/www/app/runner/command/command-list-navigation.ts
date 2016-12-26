import {CommandWrapper} from "./command-wrapper";
export class CommandListNavigation {

    constructor(public fromCursor: number) {
    }

    public command: CommandWrapper;
    public navigate: boolean = false;
    public reset: boolean = false;
    public fromHidden: boolean = false;
    public fromPristine: boolean = false;

}