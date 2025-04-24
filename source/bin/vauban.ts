#!/usr/bin/env node

import {ArcaneEnv, ArcaneManager, IPackage, Terminal} from "@protorians/arcane-core";
import {dirname} from "path";
import activateVerbose = ArcaneEnv.activateVerbose;
import path from "node:path";
import {HMR} from "../supports/hmr.js";
import {execSync} from "node:child_process";
import {Logger, Vauban} from "../supports/index.js";
import {TSConfig} from "../supports/tsconfig.js";


const __dirname = (import.meta.dirname);
const vaubanDir = dirname(dirname(__dirname));
const appDir = process.cwd();
const pkg = ArcaneManager.packageInfo(vaubanDir) as IPackage;
const make = ArcaneManager.create();
const argv = ArcaneManager.serializeArgv(process.argv);

try {

    Vauban.directory = vaubanDir;
    Vauban.appDir = appDir;

    /**
     * Mount CLI
     */
    make.name(pkg.displayName || pkg.name);
    make.version(pkg.version || '0.0.1')
    make.description(pkg.description || '')

    make
        .name('dev')
        .command('dev')
        .description('Start Vauban server in dev mode')
        // .option("--silent, -s", "Disable logging",)
        .action(async () => {
            TSConfig.initialize();
            activateVerbose();
            await HMR.prebuild();
            await Vauban.initialize();
            Terminal.Display.notice('Vauban', Vauban.config.$.mode?.toUpperCase())
            execSync(`node ${path.join(appDir, Vauban.cacheDir, 'main.js')}`, {stdio: 'inherit'});
        });

    make
        .name('build')
        .command('build')
        .description('Build server')
        // .option("--silent, -s", "Disable logging",)
        .action(async () => {
            TSConfig.initialize();
            activateVerbose();
            await Vauban.initialize();


            const directories = Vauban.directories;
            const sourcedir = path.join(Vauban.appDir, directories.source || 'source');

            Terminal.Display.notice('Vauban', 'Building...')
            Logger.warn('Directory', sourcedir)

            await HMR.prebuild();
            execSync(
                `vite build --config ${
                    path.join(Vauban.directory, 'resources', 'vite.config.ts')
                }`,
                {stdio: 'inherit'}
            );


            // Vauban.config.set('mode', currentMode)
        })

    make.parse(argv);

} catch (err) {
    console.error('Error', err)
    process.exit(1)
}