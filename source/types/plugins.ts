import type {IMiddlewareCallable} from "./middleware.js";
import type {IRouteThirdPayload} from "./route.js";
import type { IBackendSignalCallable } from "./backend.js";



export interface IPluginOptions {
    name: string;

    route?: IRouteThirdPayload;

    middleware?: IMiddlewareCallable;

    event?: IBackendSignalCallable;
}

export interface IPlugin {
    readonly options: IPluginOptions;

    detach(): void;
}