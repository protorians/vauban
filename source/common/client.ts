import {IBackendConfig} from "../types/backend.js";

export class VaubanClient {
    static get metas() {
        const metas: { [K: string]: any } = {}
        for (const meta of Array.from(document.querySelectorAll<HTMLMetaElement>('meta[vauban\\:client]'))) {
            const name = meta.getAttribute('name')
            if (name) metas[name] = meta.getAttribute('content') || null
        }
        return metas;
    }

    static config<K extends keyof IBackendConfig>(key: K): IBackendConfig[K] | null {
        return this.metas[`config:${key}`] || null;
    }
}