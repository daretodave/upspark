import {ResourceTranslator} from "../resource-translator";
import * as _ from 'lodash';
import {ResourceModel} from "../resource-model";

export class JSONTranslator implements ResourceTranslator {

    deserialize<T extends ResourceModel>(type: { new(...args: any[]): T }, contents: string): T {
        let object:any = JSON.parse(contents);
        let model:T = new type();

        model.toDefaultState();

        _.merge(model, object);

        return model;
    }

    serialize<T>(model: T): string {
        return JSON.stringify(model, null, 4);
    }

}

export class Something {

    constructor(public x:number, public y:number) {
        this.x = x;
        this.y = y;
    }

    move() {
        this.x += 20;
        this.y += 20;
    }

}