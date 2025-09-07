export type IActionRunnerPayload = {
    id: string;
    name: string;
    args: any;
};
export interface IActionRunnerMapSignal {
    send: IActionRunnerPayload;
    received: IActionRunnerPayload;
}
export declare class ActionDriver {
    static _socket: WebSocket | undefined;
    protected static runners: Map<string, {
        resolve: (val: any) => void;
        reject: (err: any) => void;
    }>;
    static get socket(): WebSocket;
    protected static starting(): Promise<void>;
    static action<T>(name: string, args: any): Promise<T>;
}
