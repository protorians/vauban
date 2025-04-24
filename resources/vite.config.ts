import {defineConfig, type LogErrorOptions, type LogOptions, type LogType} from 'vite'
import {Vauban, sawsVitePlugin, Logger, ServerRuntimeMode} from "../build/index.js";
import path from 'node:path';

Vauban.workDir = process.cwd()
export default async function () {
    await Vauban.initialize()
    const directories = Vauban.directories;
    const mode = Vauban.config.$.mode || ServerRuntimeMode.Production;
    const isProduction = mode === ServerRuntimeMode.Production
    const root = path.join(Vauban.appDir, Vauban.cacheDir, directories.source || 'source')

    // Logger.highlight('Vite', 'work in', root)

    return defineConfig({
        mode,
        root,
        publicDir: path.join(Vauban.workDir, directories.public || 'source/public'),
        build: {
            outDir: Vauban.buildDir,
            minify: !isProduction,
            emptyOutDir: true,
        },
        optimizeDeps: {
            force: true,
        },
        plugins: [
            sawsVitePlugin()
        ],
        customLogger: class {
            static key: string = 'accelerate';

            static info(msg: string, options?: LogOptions): void {
                if (options?.clear) console.clear()
                Logger.highlight(this.key, msg)
            }

            static warn(msg: string, options?: LogOptions): void {
                if (options?.clear) console.clear()
                Logger.warn(this.key, msg)
            }

            static warnOnce(msg: string, options?: LogOptions): void {
                if (options?.clear) console.clear()
                Logger.warn(this.key, msg)
            }

            static error(msg: string, options?: LogErrorOptions): void {
                if (options?.clear) console.clear()
                Logger.error(this.key, msg, options?.error || '')
            }

            static clearScreen(type: LogType): void {
                console.clear()
                if (type == 'info') this.info("clear")
                if (type == 'warn') this.warn("clear")
                if (type == 'error') this.error("clear")
            }

            static hasErrorLogged(error: any): boolean {
                return error instanceof Error
            }

            static hasWarned: boolean = true;
        }
    })
}
