import * as fs from "node:fs";
import type {IModularDefaultSource} from "../types/module.js";
import {Collection, FileUtility, type ICollectionScheme} from "@protorians/core";
import {IConfiguration, IConfigurationOptions} from "../types/configs.js";
import {HMR} from "./hmr.js";
import {NonPartial} from "../types/utils.js";
import {ConfigurationLoader} from "../enums/configuration.js";
import yaml from "js-yaml";
import {Logger} from "./logger.js";


export async function loadConfiguration(source: string, loader: ConfigurationLoader) {
    if (loader === ConfigurationLoader.JS) {
        if (!fs.existsSync(source)) {
            return undefined;
        }
        if (!fs.statSync(source).isFile()) {
            return undefined;
        }
        return HMR.import<IModularDefaultSource>(source);
    } else if (loader === ConfigurationLoader.JSON) {
        return FileUtility.JsonParser(fs.readFileSync(source, 'utf8'));
    } else if (loader === ConfigurationLoader.YAML) {
        const fileContents = fs.readFileSync('config.yml', 'utf8');
        return yaml.load(fileContents);
    }

    return undefined
}

export class Configuration<T extends ICollectionScheme> extends Collection<T> implements IConfiguration<T> {

    protected _current: T = {} as T;

    constructor(
        public readonly source: string,
        public readonly options: IConfigurationOptions,
    ) {
        super()
    }

    get $(): NonPartial<T> {
        const config: any = this._current;

        for (const [key, value] of Object.entries(this.export())) {
            config[key] = value || config[key] || undefined as any;
        }

        return config as NonPartial<T>;
    }

    async sync(_config: T = {} as T): Promise<this> {
        this._current = {...this._current, ..._config};

        const loaded = await loadConfiguration(this.source, this.options.loader)
        let entries: T = {} as T;

        if (this.options.loader === ConfigurationLoader.JS) {
            if (loaded && typeof loaded.default === 'function') {
                entries = {..._config, ...(loaded.default() as T)}
            }
        } else if (
            this.options.loader === ConfigurationLoader.JSON ||
            this.options.loader === ConfigurationLoader.YAML
        ) {
            entries = {..._config, ...(loaded as T)}
        }

        for (const [key, value] of Object.entries(entries)) {
            this.set(key as keyof T, value as T[keyof T]);
        }

        return this;
    }

    save(verbose?: boolean): boolean {
        try {
            if (this.options.loader === ConfigurationLoader.JSON) {
                fs.writeFileSync(this.source, JSON.stringify(this.export(), null, 2), {encoding: "utf-8"});
                return true;
            }

            if (this.options.loader === ConfigurationLoader.YAML) {
                fs.writeFileSync(this.source, yaml.dump(this.export()), {encoding: "utf-8"});
                return true;
            }

            if (verbose)
                Logger.error(`< ${this.options.loader} > loader not supported to update the configuration file.`);

            return false;
        } catch (e) {
            Logger.error('Config', e)
            process.exit(1)
        }
    }

}