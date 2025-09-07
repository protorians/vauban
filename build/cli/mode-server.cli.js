import { ServerRuntimeMode } from "../enums/server.js";
export function getModeServerCli(prod) {
    return ((typeof prod === 'boolean' && prod) ||
        (typeof prod === 'string' &&
            (prod.toLowerCase() === 'production' || prod.toLowerCase() === 'true')))
        ? (ServerRuntimeMode.Production)
        : (process.env.NODE_ENV === 'production'
            ? ServerRuntimeMode.Production
            : ServerRuntimeMode.Development);
}
