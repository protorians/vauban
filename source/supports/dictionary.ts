import {IBackendDirectoriesKeys} from "../types/index.js";
import {Vauban} from "./vauban.js";

export class Dictionary {

    static directories(): Record<IBackendDirectoriesKeys, string> {
        const directories = {...Vauban.directories, ...(Vauban.config.$?.directories||{})};
        const accumulate: Record<IBackendDirectoriesKeys, string> = {} as Record<IBackendDirectoriesKeys, string>

        accumulate.action = directories.actions!;
        accumulate.config = directories.configs!;
        accumulate.api = directories.api!;
        accumulate.enum = directories.enums!;
        accumulate.entity = directories.entities!;
        accumulate.component = directories.components!;
        accumulate.factory = directories.factories!;
        accumulate.helper = directories.helpers!;
        accumulate.migration = directories.migrations!;
        accumulate.repository = directories.repositories!;
        accumulate.seeder = directories.seeders!;
        accumulate.service = directories.services!;
        accumulate.theme = directories.themes!;
        accumulate.view = directories.views!;

        return accumulate;
    }

}