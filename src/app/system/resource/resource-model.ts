import {Resource} from './resource';
export interface ResourceModel<T> {

    new(): ResourceModel<T>;

    toDefaultState(): void;

}