import { ObjectLiteral, Repository } from "typeorm";
export declare class RepositoryManager<T extends ObjectLiteral> {
    protected _context: Repository<T>;
    get context(): Repository<T>;
}
