import {build, BuildResult} from "esbuild";
import path from "node:path";
import {Vauban} from "./vauban.js";
import {exec} from "node:child_process";
import * as fs from "node:fs";
import {HMRContext} from "../enums/hmr.js";
import {IHMRCompilate} from "../types/index.js";
import {Logger} from "./logger.js";
import {serverActionWebSocketPlugin} from "../compiler-capabilities/server-action.js";
import {ViteDevServer, WebSocket} from "vite";

export class HMR {

    protected static stack: Map<string, string> = new Map();

    static compilerPlugins: any[] = [
        serverActionWebSocketPlugin(),
    ];

    static async import<T>(pathname: string, context: HMRContext = HMRContext.All): Promise<T | undefined> {
        const key = `${context}:${pathname}`;

        if (this.stack.has(key)) {
            return this.stack.get(key) as T;
        }

        if (!fs.existsSync(pathname)) return undefined;

        const mod = await import(`${pathname}?hmr=${Date.now()}`);
        this.stack.set(key, mod);
        return mod;
    }

    static remove(pathname: string, context: HMRContext = HMRContext.All) {
        const key = `${context}:${pathname}`;
        if (this.stack.has(key)) {
            this.stack.delete(key);
            return true;
        }
        return false;
    }

    static async replace<T>(pathname: string): Promise<T> {
        this.remove(pathname);
        return await this.import(pathname) as T;
    }

    static async compilate(payload: IHMRCompilate): Promise<BuildResult<any>> {
        return new Promise<BuildResult<any>>((resolve, reject) => {
            build({
                ...payload,
                plugins: [...(payload.plugins || []), ...HMR.compilerPlugins]
            })
                .then(async (result) => {
                    await this.replace(payload.outfile as string)
                    resolve(result)
                })
                .catch(e => reject(e))
        })
    }

    static async reload(sourcedir: string, file: string, outdir: string): Promise<void> {
        try {
            const out = path.resolve(outdir, file);
            const entry = path.resolve(sourcedir, path.dirname(file), path.basename(file));
            const output = path.resolve(outdir, path.dirname(out), path.basename(out, '.ts') + '.js');
            const label = path.relative(sourcedir, entry)

            if (!fs.existsSync(entry)) {
                Logger.warning('HMR', label, 'Not found');
            } else {
                await this.compilate({
                    entryPoints: [entry],
                    outfile: output,
                    platform: "node",
                    format: "esm",
                    minify: false,
                });
                Logger.highlight('HMR', label, 'Reloaded');
            }

        } catch (e: any) {
            Logger.error('HMR', e)
        }
    }

    static watcher() {
        const directories = Vauban.directories;
        const sourcedir = path.join(Vauban.appDir, directories.source || 'source');
        // const outputDir = path.join(Vauban.appDir, Vauban.cacheDir, directories.source || 'source')

        exec(
            `cd ${sourcedir} && npx tsc --watch`,
            (error, stdout, stderr) => {
                if (error) Logger.error('Error', error)
                Logger.error('ERROR', stderr)
                Logger.say('I', stdout)
            }
        );


        // chokidar
        //     .watch(`${sourcedir}`, {persistent: true})
        //     .on('change', (f) => HMR.reload(sourcedir, path.relative(sourcedir, f), outputDir))
        //     .on('error', (e) => Logger.error('TASK', e))
    }


    static gateway(vite: ViteDevServer, socket: WebSocket.WebSocket, fileHost: string) {
        vite.watcher.on('change', async (file) => {
            if (file !== fileHost && file.endsWith('.js')) {
                await HMR.replace(file)
                socket.send(JSON.stringify({type: 'hmr', action: 'reload', file,}))
            }
        })
    }
}