import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {KeyValue} from "./key-value";

@Pipe({
    name: 'keyValueFilter',
    pure: false
})
@Injectable()
export class KeyValueFilterPipe implements PipeTransform {

    transform(items: KeyValue[], name:string): any {
        return items.filter(item => item.key.toLowerCase().indexOf(name.toLowerCase()) !== -1);
    }
}