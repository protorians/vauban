import type {IPlugin, IPluginOptions} from "../types/index.js";
import {RecordStack} from "./instance.js";

export class Plugins {
    public static stack: Map<string, IPlugin> = new Map();
}

export class Plugin implements IPlugin {

    constructor(public readonly options: IPluginOptions) {
        RecordStack.register<string, IPlugin>(this.options.name, this, Plugins.stack)
    }

    detach(): void {
        RecordStack.unregister<string, IPlugin>(this.options.name, Plugins.stack)
    }
}
