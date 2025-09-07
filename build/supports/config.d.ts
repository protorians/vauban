import { Collection, type ICollectionScheme } from "@protorians/core";
import { IConfiguration, IConfigurationOptions } from "../types/configs.js";
import { NonPartial } from "../types/utils.js";
import { ConfigurationLoader } from "../enums/configuration.js";
export declare function loadConfiguration(source: string, loader: ConfigurationLoader): Promise<any>;
export declare class Configuration<T extends ICollectionScheme> extends Collection<T> implements IConfiguration<T> {
    readonly source: string;
    readonly options: IConfigurationOptions;
    protected _current: T;
    constructor(source: string, options: IConfigurationOptions);
    get $(): NonPartial<T>;
    sync(_config?: T): Promise<this>;
    save(verbose?: boolean): boolean;
}
