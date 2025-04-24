import type {IMiddlewareCallable} from "./middleware.js";
import type {IRoutePayload} from "./route.js";
import type { IServerSignalCallable } from "./server.js";



export interface IPluginOptions {
    name: string;

    route?: IRoutePayload;

    middleware?: IMiddlewareCallable;

    event?: IServerSignalCallable;
}

export interface IPlugin {
    readonly options: IPluginOptions;

    detach(): void;
}