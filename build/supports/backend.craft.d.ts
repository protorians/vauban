import { CraftArtifact } from "../enums/craft.js";
import { IBackendCraftingTemplate } from "../types/index.js";
export declare class BackendCraft {
    static resolve(type: CraftArtifact, identifier: string): IBackendCraftingTemplate | undefined;
    static action(identifier: string): IBackendCraftingTemplate;
    static enum(identifier: string): IBackendCraftingTemplate;
    static entity(identifier: string): IBackendCraftingTemplate;
    static factory(identifier: string): IBackendCraftingTemplate;
    static migration(identifier: string): IBackendCraftingTemplate;
    static repository(identifier: string): IBackendCraftingTemplate;
    static seeder(identifier: string): IBackendCraftingTemplate;
    static component(identifier: string): IBackendCraftingTemplate;
    static helper(identifier: string): IBackendCraftingTemplate;
    static config(identifier: string): IBackendCraftingTemplate;
    static theme(identifier: string): IBackendCraftingTemplate;
    static api(identifier: string): IBackendCraftingTemplate;
    static service(identifier: string): IBackendCraftingTemplate;
    static view(identifier: string): IBackendCraftingTemplate;
}
