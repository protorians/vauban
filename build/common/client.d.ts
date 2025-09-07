import { IBackendConfig } from "../types/backend.js";
export declare class VaubanClient {
    static get metas(): {
        [K: string]: any;
    };
    static config<K extends keyof IBackendConfig>(key: K): IBackendConfig[K] | null;
}
