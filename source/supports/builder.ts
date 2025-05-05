import path from "node:path";
import {build, ESBuildOptions, InlineConfig, LibraryOptions, PluginOption} from "vite";
import {Vauban} from "./vauban.js";
import {Logger, ViteLogger} from "./logger.js";
import {DirectoryManager} from "./fs.js";
import {sawsVitePlugin} from "../compiler-capabilities/server-action.js";
import {ServerRuntimeMode} from "../enums/server.js";
import {ViewFragment} from "../enums/view.js";
import {BackendView} from "./view.js";
import {terser} from "rollup-plugin-terser"
import {ProgressSpinner} from "./progress.spinner.js";
import {exec} from "node:child_process";


export interface IBuilderOptions {
    loader: 'js' | 'ts';
}

export interface IBuilderCompileOptions {
    id: string;
    mode: ServerRuntimeMode;
    entry: Record<string, string> | string;
    output: string;
}


export class BackendBuilder {

    protected id: string;
    protected entry: string;
    protected base: string;
    protected output: string;

    constructor(
        protected directory: string,
        protected _options: Partial<IBuilderOptions> = {}
    ) {
        this.id = directory == '.' ? 'index' : path.basename(directory);
        this._options.loader = this._options.loader || 'ts';
        this.base = path.join(Vauban.appDir, Vauban.directories.views!);
        this.entry = path.join(this.base, this.directory, `index.${this.options.loader}`);
        this.output = path.join(Vauban.staticViewsDir, this.directory);
    }

    get options(): IBuilderOptions {
        return (this._options || {}) as IBuilderOptions;
    }

    async start() {
        const mode = (Vauban.config.$.mode || ServerRuntimeMode.Production) as ServerRuntimeMode;
        await BackendBuilder.compilate({
            id: this.id,
            mode,
            entry: this.entry,
            output: this.output,
        })
    }

    static async compilate({id, mode, entry, output,}: IBuilderCompileOptions) {
        try {
            DirectoryManager.create(output)

            const isProd = mode === ServerRuntimeMode.Production;
            const isMultiple = typeof entry === 'object';
            const lib: LibraryOptions | undefined = isMultiple
                ? undefined : {
                    entry: entry,
                    name: id,
                    fileName: () => `index.bundle.js`,
                    formats: ['iife'],
                }
            const input: Record<string, string> | undefined = isMultiple
                ? entry : undefined;


            /** Config Build */
            const buildConfig: ESBuildOptions | undefined = isProd
                ? {
                    minifyWhitespace: true,
                    minifyIdentifiers: false,
                    minifySyntax: false,
                    legalComments: "none",
                } : undefined;


            /** Config Plugins */
            const plugins: PluginOption[] = [sawsVitePlugin(),]
            if (isProd) {
                plugins.push(
                    terser({
                        keep_classnames: true,
                        keep_fnames: true,
                    })
                )
            }

            /** Main file creation */
            if (isMultiple) {
                for (const filename of Object.values(entry)) {
                    BackendView.createMain(path.join(path.dirname(filename), `${ViewFragment.Main}.js`))
                }
            }
            if (!isMultiple) {
                BackendView.createMain(path.join(path.dirname(entry), `${ViewFragment.Main}.js`))
            }

            const config: InlineConfig = {
                mode: mode,
                optimizeDeps: {force: true},
                plugins,
                customLogger: ViteLogger,
                forceOptimizeDeps: true,
                esbuild: buildConfig,
                build: {
                    outDir: output,
                    minify: "esbuild",
                    emptyOutDir: true,
                    lib,
                    rollupOptions: {
                        input,
                        output: {
                            entryFileNames: '[name].main.js',
                            chunkFileNames: 'vendor.[hash:21].js',
                        }
                    },
                },
            };

            await build(config);
            Logger.success('Done', 'Build completed successfully!');
        } catch (error) {
            Logger.error('failed', 'Build failed:', error);
            process.exit(1);
        }
    }

    static async bulk(
        base: string,
        directories: string[],
        options: Partial<IBuilderOptions> = {}
    ) {
        options.loader = options.loader || 'ts';

        const output = Vauban.staticViewsDir;
        const mode = (Vauban.config.$.mode || ServerRuntimeMode.Production) as ServerRuntimeMode;
        const entries: Record<string, string> = {}

        for (const directory of directories) {
            const index: string = `${directory == '.' ? '' : `${directory}/`}index`
            const filename: string = `${ViewFragment.Main}.${options.loader}`
            entries[index] = path.join(base, directory, filename);
        }

        await BackendBuilder.compilate({
            mode,
            id: 'bundles',
            entry: entries,
            output: output,
        })

        return entries;
    }


    static async caching() {
        return new Promise<void>(async (resolve, reject) => {
            const spinner = await ProgressSpinner.create('Caching...')

            try {
                exec(`cd ${Vauban.appDir} && npx tsc`, (err, stdout) => {
                    spinner.stop();
                    if (err) {
                        Logger.error('App', 'Build failed, check your project build');
                        Logger.error('Stack', stdout);
                        process.exit(1);
                    }
                    // Logger.info("App", 'Ready!');
                    resolve()
                })
            } catch (e) {
                spinner.stop();
                Logger.error('App', e)
                reject(e)
            }
        })
    }
}