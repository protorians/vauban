import path from "node:path";
import {Vauban} from "./vauban.js";
import {HMR} from "./hmr.js";
import {FileManager} from "./fs.js";


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

}