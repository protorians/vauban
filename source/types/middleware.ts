import {TreatmentQueueStatus} from "@protorians/core";
import type {IBackendIncomingPayload} from "./backend.js";


export interface IMiddlewareOptions {
}

export type IMiddlewareResponse = TreatmentQueueStatus.Exit | TreatmentQueueStatus.Continue

export type IMiddlewareCallable = (payload: IBackendIncomingPayload) => Promise<IMiddlewareResponse>;

export interface IMiddleware {
    name: string;
    callable: IMiddlewareCallable;
}

export interface IMiddlewares {
}