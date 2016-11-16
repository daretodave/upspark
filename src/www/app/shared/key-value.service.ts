import { Injectable } from '@angular/core';
import {KeyValue} from "./key-value";

@Injectable()
export class KeyValueService {

    data:KeyValue[] = [];
    toImport:KeyValue[] = [];
    edit:KeyValue = null;
    init:boolean = false;

}