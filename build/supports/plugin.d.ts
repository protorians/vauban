import type { IPlugin, IPluginOptions } from "../types/index.js";
export declare class Plugins {
    static stack: Map<string, IPlugin>;
}
export declare class Plugin implements IPlugin {
    readonly options: IPluginOptions;
    constructor(options: IPluginOptions);
    detach(): void;
}
