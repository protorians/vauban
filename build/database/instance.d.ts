import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { IDatabaseConnect, IDatabaseEntitySchema } from "../types/index.js";
export declare class DatabaseInstance implements IDatabaseConnect {
    readonly options: DataSourceOptions;
    protected _current: DataSource | undefined;
    constructor(options: DataSourceOptions);
    get current(): DataSource | undefined;
    getEntities(): IDatabaseEntitySchema[];
    context(): DataSource;
}
