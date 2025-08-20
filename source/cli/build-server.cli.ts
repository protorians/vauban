import {Vauban} from "../supports/index.js";
import {BackendBuilder} from "../supports/builder.js";
import path from "node:path";
import {BackendMapper} from "../supports/backend.mapper.js";
import {getModeServerCli} from "./mode-server.cli.js";
import {initializeCli} from "./initialize.cli.js";


export interface IBuildServerOption {
    prod?: boolean;
}

export async function buildServerCli({prod}: IBuildServerOption) {
    await initializeCli();
    await BackendBuilder.caching();

    const mode = getModeServerCli(prod)
    Vauban.config.set('mode', mode).save(true)

    const directories = Vauban.directories;
    const views = path.join(Vauban.appDir, Vauban.cacheDir, directories.views!)
    const files = await BackendMapper.scan(views)
    files.unshift('.')

    await BackendBuilder.bulk(views, files, {loader: 'js'})
}