import {Vauban} from "../supports/index.js";
import {BackendBuilder} from "../supports/builder.js";
import {execSync} from "node:child_process";
import path from "node:path";
import {getModeServerCli} from "./mode-server.cli.js";
import {initializeCli} from "./initialize.cli.js";


export interface IStartServerOption {
    prod?: boolean;
}

export async function startServerCli({prod}: IStartServerOption) {
    await initializeCli();
    await BackendBuilder.caching();

    const appDir = Vauban.appDir;
    const mode = getModeServerCli(prod)
    Vauban.config.set('mode', mode).save(true)

    execSync(`node ${path.join(appDir, Vauban.cacheDir, 'main.js')} --mode="${mode}"`, {stdio: 'inherit'});
}