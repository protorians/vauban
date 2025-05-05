import path from "node:path";
import {Vauban} from "./vauban.js";
import {HMR} from "./hmr.js";
import {FileManager} from "./fs.js";
import {WebSocket} from "vite";


export class ServerActons {
    static manifestSlug: string = "server-actions.manifest.json";
    static actions: Map<string, Function> = new Map<string, Function>()

    static get manifestFile(): string {
        return path.join(Vauban.workDir, this.manifestSlug)
    }

    static manifest(): Record<string, string> {
        return Vauban.workDir.trim().length > 1
            ? JSON.parse(
                (FileManager.safeRead(this.manifestFile, 'utf-8', '{}'))
                    .toString()
            ) : {};
    }

    static update(entries: Record<string, string>): boolean {
        try {
            const manifest = this.manifest();
            for (const [key, source] of Object.entries(entries)) {
                manifest[key] = source;
            }
            FileManager.create(this.manifestFile, manifest, 'utf-8');
            return true;
        } catch (e) {
            return false;
        }
    }

    static async getActions() {
        for (const [serial, pathname] of Object.entries(this.manifest())) {
            const ex = serial.split(':')
            const name = ex[1] || ex[0];
            const file = path.join(Vauban.appDir, pathname as string);
            const mod = await HMR.import<any>(file);
            const fn = mod[name] || mod.default || undefined;
            if (fn) this.actions.set(serial, fn)
        }
        return this.actions;
    }

    static async gateway(socket: WebSocket.WebSocket) {
        const actions = await this.getActions();

        socket.on('message', async (msg: any) => {
            try {
                const parsed = JSON.parse(msg.toString());
                if (typeof actions === 'undefined') return;
                if (parsed.type !== 'action') return;

                const {name, payload, requestId} = parsed;
                const explode = name.split(':')
                const action = actions?.get(name);

                if (!action) {
                    socket.send(JSON.stringify({
                        type: 'error',
                        error: `Action "${explode[1] || explode[0]}" not found.`,
                        requestId,
                    }))
                    return;
                }
                const result = await action(payload);
                socket.send(JSON.stringify({
                    type: 'response',
                    name,
                    result,
                    requestId,
                }));
            } catch (err) {
                socket.send(JSON.stringify({
                    type: 'error',
                    error: (err as Error).message,
                }));
            }
        });
    }

}