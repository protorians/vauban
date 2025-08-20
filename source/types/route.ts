import {IBackendIncomingPayload, IBackendMethods, IBackendResponse} from "./backend.js";
import {FastifyRequest} from "fastify";
import {ISchematic} from "@protorians/core"


export type IRouteCallable = (payload: IBackendIncomingPayload) => void

export interface IRouteThirdPayload {
    path: string;
    callable: IRouteCallable;
    method?: IBackendMethods[];
}


export interface IControllableProps {
    endpoint: string;
}

export interface IControllableScheme {
    key?: string;
    pathname: string;
    target: any;
    props: IControllableProps;
    routes: IRoutableScheme[]
}

export interface IControllable {
    useRequest(request: FastifyRequest): this;

    useResponse(response: IBackendResponse): this;
}

export type IRoutablePayloads = {}

export interface IRoutableProps {
    path: string | RegExp;
    status?: number;
    type?: string;
    method: IBackendMethods;
    payload?: Record<string, ISchematic>;
    // payload?: Record<string, RegExp | string | RoutablePayloadType>;
}

export interface IRoutableScheme {
    key: string;
    pathname: string | RegExp;
    target: any;
    props: IRoutableProps;
}

export interface IRoutable {
}
