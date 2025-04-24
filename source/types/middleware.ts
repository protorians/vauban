import {TreatmentQueueStatus} from "@protorians/core";
import type {IServerIncomingPayload} from "./server.js";


export interface IMiddlewareOptions {
}

export type IMiddlewareResponse = TreatmentQueueStatus.Exit | TreatmentQueueStatus.Continue

export type IMiddlewareCallable = (payload: IServerIncomingPayload) => Promise<IMiddlewareResponse>;

export interface IMiddleware {
    name: string;
    callable: IMiddlewareCallable;
}

export interface IMiddlewares {
}