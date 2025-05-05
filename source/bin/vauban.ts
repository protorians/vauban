#!/usr/bin/env node

import {ArcaneManager, IPackage} from "@protorians/arcane-core";
import {dirname} from "path";
import {Vauban} from "../supports/index.js";
import {type IStartServerOption, startServerCli} from "../cli/start-server.cli.js";
import {type IBuildServerOption, buildServerCli} from "../cli/build-server.cli.js";
import {craftCli} from "../cli/craft.cli.js";
import {ICraftArtifacts} from "../types/craft.js";


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
        .name('VaubanStarting')
        .command('start')
        .description('Start Vauban Server')
        .option('-p, --prod <boolean>', 'Start in dev mode', undefined)
        .action(async (option: IStartServerOption) => await startServerCli(option));

    make
        .name('VaubanBuilding')
        .command('build')
        .description('Build Vauban project')
        .option('-p, --prod <boolean>', 'Build in dev mode', undefined)
        .action(async (option: IBuildServerOption) => await buildServerCli(option));

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
        .action(async (identifier: string, options: ICraftArtifacts) => craftCli(identifier, options));


    // make
    //     .name('api')
    //     .command('api')
    //     .description('Create API endpoint')
    //     .argument('<string>', 'API endpoint name')
    //     .action((name: string) => {
    //         console.log('Command not implemented yet :', name)
    //     });
    //
    // make
    //     .name('action')
    //     .command('action')
    //     .description('Create a server action')
    //     .argument('<string>', 'Server action name')
    //     .action((name: string) => {
    //         console.log('Command not implemented yet :', name)
    //     });
    //
    // make
    //     .name('component')
    //     .command('component')
    //     .description('Create a component')
    //     .argument('<string>', 'component name')
    //     .action((name: string) => {
    //         console.log('Command not implemented yet :', name)
    //     });
    //
    // make
    //     .name('config')
    //     .command('config')
    //     .description('Create a config')
    //     .argument('<string>', 'config name')
    //     .action((name: string) => {
    //         console.log('Command not implemented yet :', name)
    //     });
    //
    // make
    //     .name('helper')
    //     .command('helper')
    //     .description('Create a helper')
    //     .argument('<string>', 'helper name')
    //     .action((name: string) => {
    //         console.log('Command not implemented yet :', name)
    //     });
    //
    // make
    //     .name('service')
    //     .command('service')
    //     .description('Create a service')
    //     .argument('<string>', 'service name')
    //     .action((name: string) => {
    //         console.log('Command not implemented yet :', name)
    //     });
    //
    // make
    //     .name('view')
    //     .command('view')
    //     .description('Create a view')
    //     .argument('<string>', 'view name')
    //     .action((name: string) => {
    //         console.log('Command not implemented yet :', name)
    //     });

    make.parse(argv);

} catch (err) {
    console.error('Error', err)
    process.exit(1)
}