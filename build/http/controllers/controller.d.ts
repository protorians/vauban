import { FastifyRequest } from "fastify";
import { IBackendResponse, IControllable } from "../../types/index.js";
export declare class Controller implements IControllable {
    protected request: FastifyRequest;
    protected response: IBackendResponse;
    static readonly prefix: string;
    useRequest(request: FastifyRequest): this;
    useResponse(response: IBackendResponse): this;
}
