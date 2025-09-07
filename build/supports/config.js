import * as fs from "node:fs";
import { Collection, FileUtility } from "@protorians/core";
import { HMR } from "./hmr.js";
import { ConfigurationLoader } from "../enums/configuration.js";
import yaml from "js-yaml";
import { Logger } from "./logger.js";
export async function loadConfiguration(source, loader) {
    if (loader === ConfigurationLoader.JS) {
        if (!fs.existsSync(source)) {
            return undefined;
        }
        if (!fs.statSync(source).isFile()) {
            return undefined;
        }
        return HMR.import(source);
    }
    else if (loader === ConfigurationLoader.JSON) {
        return FileUtility.JsonParser(fs.readFileSync(source, 'utf8'));
    }
    else if (loader === ConfigurationLoader.YAML) {
        const fileContents = fs.readFileSync('config.yml', 'utf8');
        return yaml.load(fileContents);
    }
    return undefined;
}
export class Configuration extends Collection {
    source;
    options;
    _current = {};
    constructor(source, options) {
        super();
        this.source = source;
        this.options = options;
    }
    get $() {
        const config = this._current;
        for (const [key, value] of Object.entries(this.export())) {
            config[key] = value || config[key] || undefined;
        }
        return config;
    }
    async sync(_config = {}) {
        this._current = { ...this._current, ..._config };
        const loaded = await loadConfiguration(this.source, this.options.loader);
        let entries = {};
        if (this.options.loader === ConfigurationLoader.JS) {
            if (loaded && typeof loaded.default === 'function') {
                entries = { ..._config, ...loaded.default() };
            }
        }
        else if (this.options.loader === ConfigurationLoader.JSON ||
            this.options.loader === ConfigurationLoader.YAML) {
            entries = { ..._config, ...loaded };
        }
        for (const [key, value] of Object.entries(entries)) {
            this.set(key, value);
        }
        return this;
    }
    save(verbose) {
        try {
            if (this.options.loader === ConfigurationLoader.JSON) {
                fs.writeFileSync(this.source, JSON.stringify(this.export(), null, 2), { encoding: "utf-8" });
                return true;
            }
            if (this.options.loader === ConfigurationLoader.YAML) {
                fs.writeFileSync(this.source, yaml.dump(this.export()), { encoding: "utf-8" });
                return true;
            }
            if (verbose)
                Logger.error(`< ${this.options.loader} > loader not supported to update the configuration file.`);
            return false;
        }
        catch (e) {
            Logger.error('Config', e);
            process.exit(1);
        }
    }
}
