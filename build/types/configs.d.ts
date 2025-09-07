import { ICollection, ICollectionScheme } from "@protorians/core";
import { ConfigurationLoader } from "../enums/configuration.js";
export interface IConfiguration<T extends ICollectionScheme> extends ICollection<T> {
    get $(): T;
    sync(defaultConfig?: T): Promise<this>;
    save(verbose?: boolean): boolean;
}
export interface IConfigurationOptions {
    loader: ConfigurationLoader;
}
