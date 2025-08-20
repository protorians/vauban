import "reflect-metadata"
import {DataSource, DataSourceOptions} from "typeorm";
import {IDatabaseConnect, IDatabaseEntitySchema} from "../types/index.js";
import {Vauban} from "../supports/index.js";
import path from "node:path";


export class DatabaseInstance implements IDatabaseConnect {

    protected _current: DataSource | undefined;

    constructor(public readonly options: DataSourceOptions) {
    }

    get current(): DataSource | undefined {
        return this._current;
    }

    getEntities(): IDatabaseEntitySchema[] {
        return [`${path.join(Vauban.appDir, Vauban.cacheDir, Vauban.config.$.directories?.entities || 'database/entities')}/**/*.entity.{js,ts}`];
    }

    context(): DataSource {
        const migrations = [`${path.join(Vauban.appDir, Vauban.cacheDir, Vauban.config.$.directories?.migrations || 'database/migrations')}/**/*.migration.{js,ts}`];
        const entities = Object.values(this.options.entities || [])

        this._current = this._current || (new DataSource({
            migrations: migrations,
            ...this.options,
            entities: entities.length > 0 ? entities : this.getEntities(),
            migrationsTableName: this.options.migrationsTableName || 'system_migrations',
        } as DataSourceOptions));

        return this._current;
    }
}