import {Upspark} from "../upspark";
export abstract class ApiModule {

    public upspark:Upspark;

    public abstract package():string;

}