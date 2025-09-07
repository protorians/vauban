export class VaubanClient {
    static get metas() {
        const metas = {};
        for (const meta of Array.from(document.querySelectorAll('meta[vauban\\:client]'))) {
            const name = meta.getAttribute('name');
            if (name)
                metas[name] = meta.getAttribute('content') || null;
        }
        return metas;
    }
    static config(key) {
        return this.metas[`config:${key}`] || null;
    }
}
