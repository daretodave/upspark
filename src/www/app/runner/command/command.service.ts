import {Injectable} from "@angular/core";
import {Command} from "./command";
import {SystemService} from "../../shared/system/system.service";

@Injectable()
export class CommandService {

    private commands:Command[];

    constructor(system:SystemService) {
        this.commands = [];
    }

    execute(args:string) {

        let title:string = args;
        let argument:string = null;
        let blocks:string[] = args.split(":", 2);

        if(blocks.length > 1) {
            title = blocks[0].trim();
            if(blocks[1].trim().length) {
                argument = blocks[1].trim();
            }
        }


    }

}