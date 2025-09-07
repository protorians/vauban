import { build } from "esbuild";
import path from "node:path";
import { Vauban } from "./vauban.js";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import { HMRContext } from "../enums/hmr.js";
import { Logger } from "./logger.js";
import { serverActionWebSocketPlugin } from "../compiler-capabilities/server-action.js";
export class HMR {
    static stack = new Map();
    static compilerPlugins = [
        serverActionWebSocketPlugin(),
    ];
    static async import(pathname, context = HMRContext.All) {
        const key = `${context}:${pathname}`;
        if (this.stack.has(key)) {
            return this.stack.get(key);
        }
        if (!fs.existsSync(pathname))
            return undefined;
        const mod = await import(`${pathname}?hmr=${Date.now()}`);
        this.stack.set(key, mod);
        return mod;
    }
    static remove(pathname, context = HMRContext.All) {
        const key = `${context}:${pathname}`;
        if (this.stack.has(key)) {
            this.stack.delete(key);
            return true;
        }
        return false;
    }
    static async replace(pathname) {
        this.remove(pathname);
        return await this.import(pathname);
    }
    static async compilate(payload) {
        return new Promise((resolve, reject) => {
            build({
                ...payload,
                plugins: [...(payload.plugins || []), ...HMR.compilerPlugins]
            })
                .then(async (result) => {
                await this.replace(payload.outfile);
                resolve(result);
            })
                .catch(e => reject(e));
        });
    }
    static async reload(sourcedir, file, outdir) {
        try {
            const out = path.resolve(outdir, file);
            const entry = path.resolve(sourcedir, path.dirname(file), path.basename(file));
            const output = path.resolve(outdir, path.dirname(out), path.basename(out, '.ts') + '.js');
            const label = path.relative(sourcedir, entry);
            if (!fs.existsSync(entry)) {
                Logger.warning('HMR', label, 'Not found');
            }
            else {
                await this.compilate({
                    entryPoints: [entry],
                    outfile: output,
                    platform: "node",
                    format: "esm",
                    minify: false,
                });
                Logger.highlight('HMR', label, 'Reloaded');
            }
        }
        catch (e) {
            Logger.error('HMR', e);
        }
    }
    static watcher() {
        const directories = { ...Vauban.directories, ...Vauban.config.$.directories };
        const sourcedir = path.join(Vauban.appDir, directories.root || '');
        spawn('cd', [
            sourcedir,
            '&&',
            'npx tsc --watch'
        ], {
            shell: true,
        });
    }
    static gateway(vite, socket, fileHost, onUpdate) {
        vite.watcher.on('change', async (file) => {
            if (file !== fileHost && file.endsWith('.js')) {
                await HMR.replace(file);
                await onUpdate?.(file);
                socket.send(JSON.stringify({ type: 'hmr', action: 'reload', file, }));
            }
        });
    }
}
