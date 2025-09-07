import { IBackendView, IBackendViewOptions } from "../types/view.js";
import { ViewFragment } from "../enums/view.js";
import type { IModularDefaultSource, IModularView } from "../types/index.js";
export declare class BackendView implements IBackendView {
    readonly id: string;
    protected _options: IBackendViewOptions;
    readonly uri: string;
    readonly filename: string;
    readonly pathname: string;
    readonly dirname: string;
    readonly basename: string;
    protected code: string;
    constructor(id: string, _options?: IBackendViewOptions);
    get options(): Readonly<IBackendViewOptions>;
    get exists(): boolean;
    path(name: string | ViewFragment): string;
    send<T extends Record<any, any>>(params: T): Promise<string>;
    import(): Promise<IModularView>;
    mockup(): Promise<IModularDefaultSource>;
    build(content: string): Promise<string>;
    render<T extends Record<any, any>>(params: T): Promise<string>;
    file<T>(name: string): Promise<T | undefined>;
    fragment<T>(name: ViewFragment): Promise<T | undefined>;
    static get directory(): string;
    static createMain(output: string, basename?: string): typeof this;
    static preset(basename: string): string;
}
