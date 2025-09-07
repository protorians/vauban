import { WebSocket } from "vite";
export declare class ServerActons {
    static manifestSlug: string;
    static actions: Map<string, Function>;
    static get manifestFile(): string;
    static manifest(): Record<string, string>;
    static update(entries: Record<string, string>): boolean;
    static getActions(): Promise<Map<string, Function>>;
    static gateway(socket: WebSocket.WebSocket): Promise<void>;
}
