import { TreatmentQueueStatus } from "@protorians/core";
import { RecordStack } from "./instance.js";
export class Middlewares {
    static stack = new Map();
    static use(middleware) {
        RecordStack.register(middleware.name, middleware, Middlewares.stack);
        return this;
    }
    static unuse(middleware) {
        RecordStack.unregister(middleware.name, Middlewares.stack);
        return this;
    }
    static async run(payload) {
        for (const middleware of this.stack.values()) {
            const next = await middleware.callable(payload);
            if (next === TreatmentQueueStatus.Exit)
                break;
        }
    }
}
export class Middleware {
    name;
    callable;
    constructor(name, callable) {
        this.name = name;
        this.callable = callable;
    }
}
export function createMiddleware(name, callable) {
    return new Middleware(name, callable);
}
