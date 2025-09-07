import { IMiddleware, IMiddlewareCallable, IBackendIncomingPayload } from "../types/index.js";
export declare class Middlewares {
    static stack: Map<string, IMiddleware>;
    static use(middleware: IMiddleware): typeof this;
    static unuse(middleware: IMiddleware): typeof this;
    static run(payload: IBackendIncomingPayload): Promise<void>;
}
export declare class Middleware implements IMiddleware {
    readonly name: string;
    readonly callable: IMiddlewareCallable;
    constructor(name: string, callable: IMiddlewareCallable);
}
export declare function createMiddleware(name: string, callable: IMiddlewareCallable): IMiddleware;
