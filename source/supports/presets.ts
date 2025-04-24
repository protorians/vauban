import {FileManager} from "./fs.js";
import path from "node:path";
import {Vauban} from "./vauban.js";

export class Presets {

    static view(): string {
        return FileManager.read(
            path.join(Vauban.directory, 'presets', 'view.pipeline.preset'),
            {encoding: 'utf-8'}
        ) as string;
    }

}