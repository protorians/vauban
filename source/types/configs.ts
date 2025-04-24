import {ICollection, ICollectionScheme} from "@protorians/core";

export interface IConfiguration<T extends ICollectionScheme> extends ICollection<T> {
    get $(): T;
    sync(defaultConfig?: T): Promise<this>
    save(): boolean;
}