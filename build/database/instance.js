import "reflect-metadata";
import { DataSource } from "typeorm";
import { Vauban } from "../supports/index.js";
import path from "node:path";
export class DatabaseInstance {
    options;
    _current;
    constructor(options) {
        this.options = options;
    }
    get current() {
        return this._current;
    }
    getEntities() {
        return [`${path.join(Vauban.appDir, Vauban.cacheDir, Vauban.config.$.directories?.entities || 'database/entities')}/**/*.entity.{js,ts}`];
    }
    context() {
        const migrations = [`${path.join(Vauban.appDir, Vauban.cacheDir, Vauban.config.$.directories?.migrations || 'database/migrations')}/**/*.migration.{js,ts}`];
        const entities = Object.values(this.options.entities || []);
        this._current = this._current || (new DataSource({
            migrations: migrations,
            ...this.options,
            entities: entities.length > 0 ? entities : this.getEntities(),
            migrationsTableName: this.options.migrationsTableName || 'system_migrations',
        }));
        return this._current;
    }
}
