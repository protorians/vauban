import {IConfiguration} from "../types/configs.js";
import {IServerBootstrapper, IServerConfig, IServerDirectories} from "../types/index.js";
import {VaubanServer} from "./server.js";
import {Configuration} from "./config.js";
import path from "node:path";
import {TSConfig} from "./tsconfig.js";
import {ServerRuntimeMode} from "../enums/server.js";

const __dirname = (import.meta.dirname);

export class Vauban {
    static slug: string = ".vauban";
    // static uri: string = "__vauban__";
    static directory: string = "";
    static appDir: string = "";
    static workDir: string = "";
    static buildDir: string = "";
    static pipelineDir: string = "";
    static cacheViewsDir: string = "";
    static cacheDir: string = "";
    static configFile: string = "vauban.config.js";
    static config: IConfiguration<IServerConfig> = {} as IConfiguration<IServerConfig>;

    static requirements(): typeof this {

        this.directory = this.directory || path.dirname(path.dirname(__dirname));
        this.appDir = this.appDir || process.cwd();

        if (!this.cacheDir) TSConfig.initialize();

        this.workDir = path.join(this.appDir, this.cacheDir, '..');
        this.buildDir = path.join(this.appDir, this.slug, 'build');
        this.pipelineDir = path.join(this.appDir, this.slug, 'pipeline');
        this.cacheViewsDir = path.join(this.appDir, this.slug, 'views');

        return this;
    }

    static get _config(): IServerConfig {
        return {
            mode: ServerRuntimeMode.Production,
            title: 'Vauban Backend Server',
            name: 'com.vauban.server',
            host: 'localhost',
            port: parseInt((process.env.PORT || 3000).toString()),
            directories: {
                source: "./source",
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
                configs: "./configs",
                database: "./database",
                entities: "./source/entities",
                factories: "./database/factories",
                migrations: "./database/migrations",
                repositories: "./source/repositories",
                schemas: "./database/schemas",
                seeders: "./database/seeders",
                components: "./source/components",
                helpers: "./source/helpers",
                payloads: "./source/payloads",
                services: "./source/services",
                themes: "./source/themes",
                views: "./source/views",
            }
        }
    }

    static get directories(): Partial<IServerDirectories> {
        return {
            ...(this._config).directories,
            ...(this.config.export().directories || {}),
        }
    }

    static async initialize(): Promise<IConfiguration<IServerConfig>> {
        this.requirements();
        this.config = await (new Configuration<IServerConfig>(path.join(Vauban.appDir, this.cacheDir, this.configFile)))
            .sync(this._config);
        return this.config;
    }

    static async run(bootstrapper?: IServerBootstrapper): Promise<void> {
        await this.initialize();
        TSConfig.initialize();
        this.config.set('port', parseInt((this.config.$.port || 5711).toString()));

        await (new VaubanServer(
            this.config.$.name || 'com.vauban.server'
        ))
            .port(this.config.$.port as number)
            .logger(this.config.$.mode === ServerRuntimeMode.Development)
            .start(bootstrapper);
    }

}