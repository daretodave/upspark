export enum CommandRuntime {
    SYSTEM,
    INTERNAL,
    PLATFORM,
    BASH,
    BASH_EXTERNAL
}
export namespace CommandRuntime {

    export const FLAG_SYSTEM: string = "*";
    export const FLAG_BASH: string = ">";
    export const FLAG_BASH_EXTERNAL: string = "$";
    export const FLAG_INTERNAL: string = ":";
    export const FLAG_PLATFORM: string = "#";

    export const from = (flag: string):CommandRuntime => {
        if(!flag || !(flag = flag.trim()).length) {
            return null;
        }

        if(flag === FLAG_PLATFORM) {
            return CommandRuntime.PLATFORM;
        }
        if(flag === FLAG_SYSTEM) {
            return CommandRuntime.SYSTEM;
        }
        if(flag === FLAG_INTERNAL) {
            return CommandRuntime.INTERNAL;
        }
        if(flag === FLAG_BASH) {
            return CommandRuntime.BASH;
        }
        if(flag === FLAG_BASH_EXTERNAL) {
            return CommandRuntime.BASH_EXTERNAL;
        }
        
        return null;
    }

}