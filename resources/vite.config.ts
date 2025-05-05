import {defineConfig} from 'vite'
import {Vauban, sawsVitePlugin, ViteLogger, ServerRuntimeMode} from "../build/index.js";
import path from 'node:path';

Vauban.workDir = process.cwd()
export default async function () {
    await Vauban.initialize()
    const directories = Vauban.directories;
    const mode = Vauban.config.$.mode || ServerRuntimeMode.Production;
    const isProduction = mode === ServerRuntimeMode.Production
    const root = path.join(Vauban.appDir, Vauban.cacheDir, directories.views!)

    return defineConfig({
        mode,
        root,
        publicDir: path.join(Vauban.workDir, directories.public || 'source/public'),
        build: {
            outDir: Vauban.staticViewsDir,
            minify: !isProduction,
            emptyOutDir: true,
        },
        plugins: [
            sawsVitePlugin()
        ],
        customLogger: ViteLogger
    })
}
