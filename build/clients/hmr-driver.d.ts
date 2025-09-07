export declare class HMRDriver {
    static _socket: WebSocket | undefined;
    protected static runners: Map<string, {
        resolve: (val: any) => void;
        reject: (err: any) => void;
    }>;
    static get socket(): WebSocket;
    protected static starting(): Promise<void>;
}
