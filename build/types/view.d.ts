import { IServerPayload } from "./backend.js";
import { ViewFragment } from "../enums/view.js";
import { IModularDefaultSource, IModularView } from "./module.js";
export interface IBackendViewOptions extends Partial<IServerPayload> {
    extension?: string;
}
export interface IBackendView {
    readonly uri: string;
    readonly filename: string;
    readonly pathname: string;
    readonly dirname: string;
    readonly basename: string;
    get options(): Partial<Readonly<IBackendViewOptions>>;
    get exists(): boolean;
    path(name: string | ViewFragment): string;
    send<T extends Record<any, any>>(params: T): Promise<string>;
    import(): Promise<IModularView>;
    mockup(): Promise<IModularDefaultSource>;
    build(content: string): Promise<string>;
    render<T extends Record<any, any>>(params: T): Promise<string>;
    file<T>(name: string): Promise<T | undefined>;
    fragment<T>(name: ViewFragment): Promise<T | undefined>;
}
