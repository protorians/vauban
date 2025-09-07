import { ServerRuntimeMode } from "../enums/server.js";
export interface IBuilderOptions {
    loader: 'js' | 'ts';
}
export interface IBuilderCompileOptions {
    id: string;
    mode: ServerRuntimeMode;
    entry: Record<string, string> | string;
    output: string;
}
export declare class BackendBuilder {
    protected directory: string;
    protected _options: Partial<IBuilderOptions>;
    protected id: string;
    protected entry: string;
    protected base: string;
    protected output: string;
    constructor(directory: string, _options?: Partial<IBuilderOptions>);
    get options(): IBuilderOptions;
    start(): Promise<void>;
    static compilate({ id, mode, entry, output, }: IBuilderCompileOptions): Promise<void>;
    static bulk(base: string, directories: string[], options?: Partial<IBuilderOptions>): Promise<Record<string, string>>;
    static caching(): Promise<void>;
}
