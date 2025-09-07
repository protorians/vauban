import { DataSource, EntitySchema } from "typeorm";
export type IDatabaseEntitySchema = string | Function | EntitySchema<any>;
export interface IDatabaseConnect {
    getEntities(): IDatabaseEntitySchema[];
    context(): DataSource;
}
