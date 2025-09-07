import { Vauban } from "./vauban.js";
import path from "node:path";
import * as fs from "node:fs";
import { Terminal } from "@protorians/arcane-core";
import { mkdirSync } from "fs";
import { FileUtility } from "@protorians/core";
export class TSConfig {
    static _$ = undefined;
    static get $() {
        return this._$;
    }
    static load() {
        let file = path.resolve(Vauban.appDir, 'tsconfig.json');
        if (!fs.existsSync(file)) {
            Terminal.Display.error('TSConfig', 'Not found');
            process.exit(1);
        }
        if (!fs.existsSync(file)) {
            Terminal.Display.error('TSConfig', 'Not found');
            process.exit(1);
        }
        this._$ = FileUtility.JsonParser(fs.readFileSync(file, 'utf8'));
        return this;
    }
    static initialize() {
        this.load();
        Vauban.cacheDir = TSConfig.$.compilerOptions.outDir || `./${Vauban.slug}/caches`;
        const dir = path.resolve(Vauban.appDir, TSConfig.$.compilerOptions.outDir || `./${Vauban.slug}/caches`);
        if (!fs.existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        if (!fs.statSync(dir).isDirectory()) {
            mkdirSync(dir, { recursive: true });
        }
        return this;
    }
}
