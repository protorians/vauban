import {IServerIncomingPayload, IServerMethods} from "./server.js";


export type IRouteCallable = (payload: IServerIncomingPayload) => void

export interface IRoutePayload {
    path: string;
    callable: IRouteCallable;
    method?: IServerMethods[];
}