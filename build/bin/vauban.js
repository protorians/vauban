#!/usr/bin/env node
import { ArcaneManager } from "@protorians/arcane-core";
import { dirname } from "path";
import { Vauban, Dictionary, DirectoryManager, Logger } from "../supports/index.js";
import { startServerCli } from "../cli/start-server.cli.js";
import { buildServerCli } from "../cli/build-server.cli.js";
import { craftCli } from "../cli/craft.cli.js";
import { initializeCli } from "../cli/initialize.cli.js";
import path from "node:path";
import fs from "node:fs";
const __dirname = (import.meta.dirname);
const vaubanDir = dirname(dirname(__dirname));
const appDir = process.cwd();
const pkg = ArcaneManager.packageInfo(vaubanDir);
const make = ArcaneManager.create();
const argv = ArcaneManager.serializeArgv(process.argv);
try {
    Vauban.directory = vaubanDir;
    Vauban.appDir = appDir;
    make.name(pkg.displayName || pkg.name);
    make.version(pkg.version || '0.0.1');
    make.description(pkg.description || '');
    make
        .name('VaubanStarting')
        .command('start')
        .description('Start Vauban Server')
        .option('-p, --prod <boolean>', 'Start in dev mode', undefined)
        .action(async (option) => await startServerCli(option));
    make
        .name('VaubanBuilding')
        .command('build')
        .description('Build Vauban project')
        .option('-p, --prod <boolean>', 'Build in dev mode', undefined)
        .action(async (option) => await buildServerCli(option));
    make
        .name('VaubanCrafting')
        .command('craft')
        .description('Craft an option')
        .argument('<string>', 'name of the item to craft')
        .option('--api', 'Craft an API endpoint', undefined)
        .option('--action', 'Craft a server action', undefined)
        .option('--component', 'Craft a widget component', undefined)
        .option('--config', 'Craft a config', undefined)
        .option('--helper', 'Craft a helper', undefined)
        .option('--service', 'Craft a service', undefined)
        .option('--view', 'Craft a widget view', undefined)
        .option('--theme', 'Craft a widget theme instance', undefined)
        .option('--entity', 'Craft a new database entity', undefined)
        .option('--factory', 'Craft a new database factory', undefined)
        .option('--migration', 'Craft a new database migration', undefined)
        .option('--repository', 'Craft a new database repository', undefined)
        .option('--seeder', 'Craft a new database seeder', undefined)
        .option('--enum', 'Craft a new enums', undefined)
        .action(async (identifier, options) => craftCli(identifier, options));
    make
        .name('Database')
        .command('database')
        .description('Vauban Database')
        .argument('<string> action', 'action name')
        .action(async (action) => {
        console.log('database', action);
    });
    make
        .name('Prune')
        .command('prune')
        .description('Vauban Prune')
        .option('--api', 'Prune api cache', undefined)
        .option('--action', 'Prune action cache', undefined)
        .option('--component', 'Prune component cache', undefined)
        .option('--config', 'Prune config cache', undefined)
        .option('--helper', 'Prune helper cache', undefined)
        .option('--service', 'Prune service cache', undefined)
        .option('--view', 'Prune view cache', undefined)
        .option('--theme', 'Prune theme cache', undefined)
        .option('--entity', 'Prune entity cache', undefined)
        .option('--factory', 'Prune factory cache', undefined)
        .option('--migration', 'Prune migration cache', undefined)
        .option('--repository', 'Prune repository cache', undefined)
        .option('--seeder', 'Prune seeder cache', undefined)
        .option('--enum', 'Prune enum cache', undefined)
        .option('--all', 'Prune all caches', undefined)
        .action(async (actions) => {
        await initializeCli();
        const directories = Dictionary.directories();
        Object.entries(actions)
            .forEach(([key, value]) => {
            if (directories[key] && value) {
                const directory = path.join(Vauban.appDir, Vauban.cacheDir, directories[key]);
                if (fs.existsSync(directory)) {
                    DirectoryManager.prune(directory);
                    Logger.success('Prune', `Pruned ${directories[key]}`);
                }
            }
        });
    });
    make.parse(argv);
}
catch (err) {
    console.error('Error', err);
    process.exit(1);
}
