export declare class BaseTable {
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
export declare class GenerableTable extends BaseTable {
    id: string;
}
export declare class UuidTable extends BaseTable {
    id: string;
}
export declare class RowableTable extends BaseTable {
    id: string;
}
export declare class IdentifiableTable extends BaseTable {
    id: string;
}
export declare class IncrementalTable extends BaseTable {
    id: string;
}
