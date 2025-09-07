import { VaubanClient } from "../common/client.js";
import { VaubanUri } from "../common/uri.js";
export class ActionDriver {
    static _socket = undefined;
    static runners = new Map();
    static get socket() {
        if (this._socket)
            return this._socket;
        const host = VaubanClient.config('host') || 'localhost';
        const port = VaubanClient.config('port') || 5711;
        this._socket = new WebSocket(`ws://${host}:${port}${VaubanUri.serverActionWebSocket}`);
        this._socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            const { requestId } = data;
            const runner = this.runners.get(requestId);
            if (!runner)
                return;
            if (data.type === 'response') {
                runner.resolve(data);
            }
            else if (data.type === 'error') {
                runner.reject(data.error);
            }
            this.runners.delete(requestId);
        });
        return this._socket;
    }
    static starting() {
        if (this.socket.readyState === this.socket.OPEN) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.socket.addEventListener('open', () => resolve(), { once: true });
        });
    }
    static async action(name, args) {
        const requestId = crypto.randomUUID();
        await this.starting();
        return new Promise((resolve, reject) => {
            this.runners.set(requestId, { resolve, reject });
            this.socket.send(JSON.stringify({
                type: 'action',
                name,
                payload: args,
                requestId
            }));
        });
    }
}
