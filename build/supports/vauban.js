import { Backend } from "./backend.js";
import { Configuration } from "./config.js";
import path from "node:path";
import { TSConfig } from "./tsconfig.js";
import { ServerRuntimeMode } from "../enums/server.js";
import { ConfigurationLoader } from "../enums/configuration.js";
import fs from "node:fs";
const __dirname = (import.meta.dirname);
export class Vauban {
    static slug = ".vauban";
    static directory = "";
    static appDir = "";
    static workDir = "";
    static staticViewsDir = "";
    static pipelineDir = "";
    static cacheViewsDir = "";
    static cacheDir = "";
    static configFile = "vauban.config";
    static config = {};
    static requirements() {
        this.directory = this.directory || path.dirname(path.dirname(__dirname));
        this.appDir = this.appDir || process.cwd();
        if (!this.cacheDir)
            TSConfig.initialize();
        this.workDir = path.join(this.appDir, this.cacheDir, '..');
        this.staticViewsDir = path.join(this.appDir, this.slug, 'statics', 'views');
        this.pipelineDir = path.join(this.appDir, this.slug, 'pipeline');
        this.cacheViewsDir = path.join(this.appDir, this.slug, 'views');
        return this;
    }
    static get _config() {
        return {
            mode: ServerRuntimeMode.Production,
            title: 'Vauban Backend Server',
            name: 'com.vauban.server',
            host: 'localhost',
            port: parseInt((process.env.PORT || 3000).toString()),
            directories: {
                root: "./source",
                public: "./source/public",
                actions: "./source/actions",
                api: "./source/api",
                assets: "./source/assets",
                images: "./source/assets/images",
                fonts: "./source/assets/fonts",
                css: "./source/assets/css",
                videos: "./source/assets/videos",
                sounds: "./source/assets/sounds",
                svg: "./source/assets/svg",
                configs: "./source/configs",
                database: "./source/database",
                entities: "./source/database/entities",
                factories: "./source/database/factories",
                migrations: "./source/database/migrations",
                repositories: "./source/database/repositories",
                seeders: "./source/database/seeders",
                components: "./source/components",
                helpers: "./source/helpers",
                payloads: "./source/payloads",
                services: "./source/services",
                themes: "./source/themes",
                views: "./source/views",
                enums: "./source/enums",
                types: "./source/types",
            }
        };
    }
    static get directories() {
        const directories = { ...this._config.directories };
        for (const [key, value] of Object.entries(this.config?.export()?.directories || {})) {
            directories[key] = value || directories[key] || undefined;
        }
        return this._config.directories || {};
    }
    static get configType() {
        return [
            ...Object.values(ConfigurationLoader)
                .filter(type => {
                return fs.existsSync(`${path.join(Vauban.appDir, this.configFile)}.${type}`);
            })
        ][0] || ConfigurationLoader.JSON;
    }
    static async initialize() {
        this.requirements();
        const type = this.configType;
        this.config = await (new Configuration(path.join(Vauban.appDir, `${this.configFile}.${type}`), { loader: type, })).sync(this._config);
        this.config.$.directories = { ...this._config.directories, ...this.config.$.directories };
        return this.config;
    }
    static async run(bootstrapper) {
        await this.initialize();
        TSConfig.initialize();
        this.config.set('port', parseInt((this.config.$.port || 5711).toString()));
        await (new Backend(this.config.$.name || 'com.vauban.server'))
            .port(this.config.$.port)
            .logger(this.config.$.mode === ServerRuntimeMode.Development)
            .start(bootstrapper);
    }
}
