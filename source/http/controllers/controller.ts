import {FastifyRequest} from "fastify";
import {IBackendResponse, IControllable} from "../../types/index.js";

export class Controller implements IControllable{

    protected request!: FastifyRequest;
    protected response!: IBackendResponse;

    public static readonly prefix: string = '/';

    useRequest(request: FastifyRequest): this {
        this.request = request;
        return this;
    }

    useResponse(response: IBackendResponse): this {
        this.response = response;
        return this;
    }

}
