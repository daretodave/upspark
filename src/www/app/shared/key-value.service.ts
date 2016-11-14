import { Injectable } from '@angular/core';
import {KeyValue} from "./key-value";

@Injectable()
export class KeyValueService {

    data:KeyValue[] = [];
    edit:KeyValue = null;
    init:boolean = false;

}