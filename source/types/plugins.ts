import type {IMiddlewareCallable} from "./middleware.js";
import type {IRoutePayload} from "./route.js";
import type { IBackendSignalCallable } from "./backend.js";



export interface IPluginOptions {
    name: string;

    route?: IRoutePayload;

    middleware?: IMiddlewareCallable;

    event?: IBackendSignalCallable;
}

export interface IPlugin {
    readonly options: IPluginOptions;

    detach(): void;
}