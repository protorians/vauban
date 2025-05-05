import {
    IMiddleware,
    IMiddlewareCallable,
    IBackendIncomingPayload,
} from "../types/index.js";
import {TreatmentQueueStatus} from "@protorians/core";
import {RecordStack} from "./instance.js";

export class Middlewares {
    static stack: Map<string, IMiddleware> = new Map();

    static use(middleware: IMiddleware): typeof this {
        RecordStack.register<string, IMiddleware>(middleware.name, middleware, Middlewares.stack)
        return this;
    }

    static unuse(middleware: IMiddleware): typeof this {
        RecordStack.unregister<string, IMiddleware>(middleware.name, Middlewares.stack)
        return this;
    }

    static async run(payload: IBackendIncomingPayload) {
        for (const middleware of this.stack.values()) {
            const next = await middleware.callable(payload);
            if (next === TreatmentQueueStatus.Exit) break;
        }
    }
}


export class Middleware implements IMiddleware {
    constructor(
        public readonly name: string,
        public readonly callable: IMiddlewareCallable,
    ) {
    }
}

export function createMiddleware(name: string, callable: IMiddlewareCallable): IMiddleware {
    return new Middleware(name, callable);
}