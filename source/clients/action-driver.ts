import {VaubanClient} from "../common/client.js";
import {VaubanUri} from "../common/uri.js";

export type IActionRunnerPayload = {
    id: string;
    name: string;
    args: any;
}

export interface IActionRunnerMapSignal {
    send: IActionRunnerPayload;
    received: IActionRunnerPayload;
}

export class ActionDriver {
    static _socket: WebSocket | undefined = undefined;
    protected static runners = new Map<string, {
        resolve: (val: any) => void,
        reject: (err: any) => void
    }>();

    static get socket(): WebSocket {
        if (this._socket) return this._socket;
        const host = VaubanClient.config('host') || 'localhost';
        const port = VaubanClient.config('port') || 5711;

        this._socket = new WebSocket(`ws://${host}:${port}${VaubanUri.serverActionWebSocket}`);
        this._socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            const {requestId} = data;
            const runner = this.runners.get(requestId);

            if (!runner) return;

            if (data.type === 'response') {
                runner.resolve(data);
            } else if (data.type === 'error') {
                runner.reject(data.error);
            }
            this.runners.delete(requestId);
        });
        return this._socket
    }

    protected static starting(): Promise<void> {
        if (this.socket.readyState === this.socket.OPEN) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.socket.addEventListener('open', () => resolve(), {once: true});
        });
    }

    static async action<T>(name: string, args: any): Promise<T> {
        const requestId = crypto.randomUUID();
        await this.starting();
        return new Promise<T>((resolve, reject) => {
            this.runners.set(requestId, {resolve, reject});
            this.socket.send(JSON.stringify({
                type: 'action',
                name,
                payload: args,
                requestId
            }));
        });
    }

}