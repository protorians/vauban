import * as fs from "node:fs";
import type {IModularDefaultSource} from "../types/module.js";
import {Collection, type ICollectionScheme} from "@protorians/core";
import {IConfiguration} from "../types/configs.js";
import {HMR} from "./hmr.js";
import {NonPartial} from "../types/utils.js";


export async function loadConfiguration(source: string) {
    if (!fs.existsSync(source)) {
        return undefined;
    }
    if (!fs.statSync(source).isFile()) {
        return undefined;
    }
    return HMR.import<IModularDefaultSource>(source);
}

export class Configuration<T extends ICollectionScheme> extends Collection<T> implements IConfiguration<T> {

    constructor(
        public readonly source: string,
    ) {
        super()
    }

    get $(): NonPartial<T> {
        return this.export() as NonPartial<T>;
    }

    async sync(_config: T = {} as T): Promise<this> {
        const loaded = await loadConfiguration(this.source)
        if (loaded && typeof loaded.default === 'function') {
            const entries = {
                ..._config,
                ...(loaded.default() as T)
            }
            for (const [key, value] of Object.entries(entries)) {
                this.set(key as keyof T, value as T[keyof T]);
            }
        }
        return this;
    }

    save(): boolean {
        try {
            fs.writeFileSync(this.source, JSON.stringify(this.export(), null, 2), {encoding: "utf-8"});
            return true;
        } catch (e) {
            return false
        }
    }

}