import path from "node:path";
import { build } from "vite";
import { Vauban } from "./vauban.js";
import { Logger, ViteLogger } from "./logger.js";
import { DirectoryManager } from "./fs.js";
import { sawsVitePlugin } from "../compiler-capabilities/server-action.js";
import { ServerRuntimeMode } from "../enums/server.js";
import { ViewFragment } from "../enums/view.js";
import { BackendView } from "./view.js";
import { terser } from "rollup-plugin-terser";
import { ProgressSpinner } from "./progress.spinner.js";
import { exec } from "node:child_process";
export class BackendBuilder {
    directory;
    _options;
    id;
    entry;
    base;
    output;
    constructor(directory, _options = {}) {
        this.directory = directory;
        this._options = _options;
        this.id = directory == '.' ? 'index' : path.basename(directory);
        this._options.loader = this._options.loader || 'ts';
        this.base = path.join(Vauban.appDir, Vauban.directories.views);
        this.entry = path.join(this.base, this.directory, `index.${this.options.loader}`);
        this.output = path.join(Vauban.staticViewsDir, this.directory);
    }
    get options() {
        return (this._options || {});
    }
    async start() {
        const mode = (Vauban.config.$.mode || ServerRuntimeMode.Production);
        await BackendBuilder.compilate({
            id: this.id,
            mode,
            entry: this.entry,
            output: this.output,
        });
    }
    static async compilate({ id, mode, entry, output, }) {
        try {
            DirectoryManager.create(output);
            const isProd = mode === ServerRuntimeMode.Production;
            const isMultiple = typeof entry === 'object';
            const lib = isMultiple
                ? undefined : {
                entry: entry,
                name: id,
                fileName: () => `index.bundle.js`,
                formats: ['iife'],
            };
            const input = isMultiple
                ? entry : undefined;
            const buildConfig = isProd
                ? {
                    minifyWhitespace: true,
                    minifyIdentifiers: false,
                    minifySyntax: false,
                    legalComments: "none",
                } : undefined;
            const plugins = [sawsVitePlugin(),];
            if (isProd) {
                plugins.push(terser({
                    keep_classnames: true,
                    keep_fnames: true,
                }));
            }
            if (isMultiple) {
                for (const filename of Object.values(entry)) {
                    BackendView.createMain(path.join(path.dirname(filename), `${ViewFragment.Main}.js`));
                }
            }
            if (!isMultiple) {
                BackendView.createMain(path.join(path.dirname(entry), `${ViewFragment.Main}.js`));
            }
            const config = {
                mode: mode,
                optimizeDeps: { force: true },
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
        }
        catch (error) {
            Logger.error('failed', 'Build failed:', error);
            process.exit(1);
        }
    }
    static async bulk(base, directories, options = {}) {
        options.loader = options.loader || 'ts';
        const output = Vauban.staticViewsDir;
        const mode = (Vauban.config.$.mode || ServerRuntimeMode.Production);
        const entries = {};
        for (const directory of directories) {
            const index = `${directory == '.' ? '' : `${directory}/`}index`;
            const filename = `${ViewFragment.Main}.${options.loader}`;
            entries[index] = path.join(base, directory, filename);
        }
        await BackendBuilder.compilate({
            mode,
            id: 'bundles',
            entry: entries,
            output: output,
        });
        return entries;
    }
    static async caching() {
        return new Promise(async (resolve, reject) => {
            const spinner = await ProgressSpinner.create('Build caches...');
            const directories = { ...Vauban.directories, ...Vauban.config.$.directories };
            const sourcedir = path.join(Vauban.appDir, directories.root || '');
            try {
                exec(`cd ${sourcedir} && npx tsc`, (err, stdout) => {
                    spinner.stop();
                    if (err) {
                        Logger.error('App', 'Build failed, check your project build');
                        Logger.error('Stack', stdout);
                        process.exit(1);
                    }
                    resolve();
                });
            }
            catch (e) {
                spinner.stop();
                Logger.error('App', e);
                reject(e);
            }
        });
    }
}
