import {ObjectLiteral, Repository} from "typeorm";

export class RepositoryManager<T extends ObjectLiteral> {
    protected _context!: Repository<T>;

    get context(): Repository<T> {
        return this._context;
    }
}