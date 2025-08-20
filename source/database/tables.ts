import {CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";


export class BaseTable {
    @CreateDateColumn({nullable: false})
    created_at!: Date;

    @UpdateDateColumn({nullable: true})
    updated_at?: Date;

    @DeleteDateColumn({nullable: true})
    deleted_at?: Date;
}

export class GenerableTable extends BaseTable {
    @PrimaryGeneratedColumn()
    id!: string;
}

export class UuidTable extends BaseTable {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
}

export class RowableTable extends BaseTable {
    @PrimaryGeneratedColumn('rowid')
    id!: string;
}

export class IdentifiableTable extends BaseTable {
    @PrimaryGeneratedColumn('identity')
    id!: string;
}

export class IncrementalTable extends BaseTable {
    @PrimaryGeneratedColumn('increment')
    id!: string;
}
