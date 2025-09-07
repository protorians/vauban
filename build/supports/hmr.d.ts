import { BuildResult } from "esbuild";
import { HMRContext } from "../enums/hmr.js";
import { IHMRCompilate } from "../types/index.js";
import { ViteDevServer, WebSocket } from "vite";
export declare class HMR {
    protected static stack: Map<string, string>;
    static compilerPlugins: any[];
    static import<T>(pathname: string, context?: HMRContext): Promise<T | undefined>;
    static remove(pathname: string, context?: HMRContext): boolean;
    static replace<T>(pathname: string): Promise<T>;
    static compilate(payload: IHMRCompilate): Promise<BuildResult<any>>;
    static reload(sourcedir: string, file: string, outdir: string): Promise<void>;
    static watcher(): void;
    static gateway(vite: ViteDevServer, socket: WebSocket.WebSocket, fileHost: string, onUpdate?: (file: string) => Promise<void>): void;
}
