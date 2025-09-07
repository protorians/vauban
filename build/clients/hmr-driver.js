import { VaubanClient } from "../common/client.js";
import { VaubanUri } from "../common/uri.js";
export class HMRDriver {
    static _socket = undefined;
    static runners = new Map();
    static get socket() {
        if (this._socket)
            return this._socket;
        const host = VaubanClient.config('host') || 'localhost';
        const port = VaubanClient.config('port') || 5711;
        this._socket = new WebSocket(`ws://${host}:${port}${VaubanUri.hmrWebSocket}`);
        this._socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'reload') {
                console.info(data);
            }
            else if (data.type === 'error') {
                console.error(data.error);
            }
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
}
