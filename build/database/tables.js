var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
export class BaseTable {
    created_at;
    updated_at;
    deleted_at;
}
__decorate([
    CreateDateColumn({ nullable: false })
], BaseTable.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn({ nullable: true })
], BaseTable.prototype, "updated_at", void 0);
__decorate([
    DeleteDateColumn({ nullable: true })
], BaseTable.prototype, "deleted_at", void 0);
export class GenerableTable extends BaseTable {
    id;
}
__decorate([
    PrimaryGeneratedColumn()
], GenerableTable.prototype, "id", void 0);
export class UuidTable extends BaseTable {
    id;
}
__decorate([
    PrimaryGeneratedColumn('uuid')
], UuidTable.prototype, "id", void 0);
export class RowableTable extends BaseTable {
    id;
}
__decorate([
    PrimaryGeneratedColumn('rowid')
], RowableTable.prototype, "id", void 0);
export class IdentifiableTable extends BaseTable {
    id;
}
__decorate([
    PrimaryGeneratedColumn('identity')
], IdentifiableTable.prototype, "id", void 0);
export class IncrementalTable extends BaseTable {
    id;
}
__decorate([
    PrimaryGeneratedColumn('increment')
], IncrementalTable.prototype, "id", void 0);
