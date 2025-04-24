import { IServerPayload } from "./server.js";

export interface IVaubanViewOptions extends IServerPayload {
    extension: string;
}