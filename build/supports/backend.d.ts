import type { IBackend, IServerBootstrapper, IBackendInstance, IBackendOptions } from "../types/index.js";
export declare class Backend implements IBackend {
    readonly name: string;
    protected _instance: IBackendInstance | undefined;
    protected _options: IBackendOptions;
    constructor(name: string);
    get instance(): IBackendInstance;
    get options(): IBackendOptions;
    logger(logger: boolean): this;
    port(port: number): this;
    start(bootstrapper?: IServerBootstrapper): Promise<typeof this>;
}
