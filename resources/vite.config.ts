import {AliasOptions, defineConfig} from 'vite'
import {Vauban, sawsVitePlugin, ViteLogger, ServerRuntimeMode} from "../build/index.js";
import path from 'node:path';

Vauban.workDir = process.cwd()
export default async function () {
    await Vauban.initialize()
    const directories = {...Vauban.directories, ...Vauban.config.$.directories};
    const mode: ServerRuntimeMode = Vauban.config.$.mode || ServerRuntimeMode.Production;
    const isProduction: boolean = mode === ServerRuntimeMode.Production
    const root: string = path.join(Vauban.appDir, directories.root!)
    const aliases: AliasOptions = {
        '@/app': Vauban.appDir
    } as AliasOptions

    Object.entries(directories).map(([key, value]) => aliases[`@/${path.basename(key)}`] = path.join(Vauban.appDir, value))

    // console.log('aliases', aliases)

    return defineConfig({
        mode,
        root,
        publicDir: path.join(Vauban.workDir, directories.public || 'source/public'),
        build: {
            // outDir: Vauban.staticViewsDir,
            minify: !isProduction,
            emptyOutDir: true,
        },
        resolve: {
            alias: aliases,
        },
        plugins: [
            sawsVitePlugin()
        ],
        customLogger: ViteLogger
    })
}
