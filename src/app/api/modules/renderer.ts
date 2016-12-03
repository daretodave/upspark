import {ApiModule} from "./api-module";
import {Upspark} from "../upspark";
import {RendererEntity} from "./renderer-entity";

export class Renderer implements ApiModule {

    public upspark:Upspark;

    public element(args:any):RendererEntity {
        let entity:RendererEntity = new RendererEntity();
        if(!args) {
            return entity;
        }

        return entity.append(args);
    }

    package(): string {
        return 'upspark/renderer';
    }
}