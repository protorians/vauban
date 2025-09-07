import { IConfiguration } from "../types/configs.js";
import { IBackendConfig, IBackendDirectories, IServerBootstrapper } from "../types/index.js";
import { ConfigurationLoader } from "../enums/configuration.js";
export declare class Vauban {
    static slug: string;
    static directory: string;
    static appDir: string;
    static workDir: string;
    static staticViewsDir: string;
    static pipelineDir: string;
    static cacheViewsDir: string;
    static cacheDir: string;
    static configFile: string;
    static config: IConfiguration<IBackendConfig>;
    static requirements(): typeof this;
    static get _config(): IBackendConfig;
    static get directories(): Partial<IBackendDirectories>;
    static get configType(): ConfigurationLoader;
    static initialize(): Promise<IConfiguration<IBackendConfig>>;
    static run(bootstrapper?: IServerBootstrapper): Promise<void>;
}
