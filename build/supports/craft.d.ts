import type { ICraft, ICraftOptions } from "../types/craft.js";
import { CraftArtifact } from "../enums/craft.js";
import { IBackendCraftingTemplate } from "../types/backend.js";
export declare class Craft implements ICraft {
    protected readonly _options: ICraftOptions;
    get options(): ICraftOptions;
    constructor(_options: ICraftOptions);
    build(type: CraftArtifact, identifier: string): Promise<IBackendCraftingTemplate | undefined>;
    start(): Promise<void>;
}
