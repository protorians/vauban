import { Logger } from "./logger.js";
import { BackendCraft } from "./backend.craft.js";
import { ProgressSpinner } from "./progress.spinner.js";
import path from "node:path";
import { Vauban } from "./vauban.js";
import fs from "node:fs";
import { FileManager } from "./fs.js";
export class Craft {
    _options;
    get options() {
        return this._options;
    }
    constructor(_options) {
        this._options = _options;
    }
    async build(type, identifier) {
        const spinner = await ProgressSpinner.create(`${type.toUpperCase()}: ${identifier} crafting...`);
        return new Promise(async (resolve, reject) => {
            const label = `${identifier} ${type.toUpperCase()}`;
            try {
                const artifact = BackendCraft.resolve(type, this.options.identifier);
                const leave = () => {
                    spinner.stop();
                    resolve(artifact);
                };
                if (typeof artifact === 'undefined')
                    throw new Error(`Craft ${label} not found`);
                const file = path.join(Vauban.appDir, artifact.directory, artifact.filename);
                if (fs.existsSync(file)) {
                    leave();
                    Logger.warn(`Craft`, `${label} already exists`);
                    return;
                }
                FileManager.create(file, artifact.code, { encoding: 'utf-8' });
                leave();
                Logger.success(`Craft`, `${label} created with success`);
            }
            catch (e) {
                spinner.stop();
                Logger.error('Craft', label, e);
                reject(e);
            }
        });
    }
    async start() {
        for (const name of Object.keys(this._options.fragments)) {
            await this.build(name, this._options.identifier);
        }
    }
}
