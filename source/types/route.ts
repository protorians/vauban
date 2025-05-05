import {IBackendIncomingPayload, IBackendMethods} from "./backend.js";


export type IRouteCallable = (payload: IBackendIncomingPayload) => void

export interface IRoutePayload {
    path: string;
    callable: IRouteCallable;
    method?: IBackendMethods[];
}