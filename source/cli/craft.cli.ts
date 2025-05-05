import {ICraftArtifacts} from "../types/craft.js";
import {Craft} from "../supports/craft.js";
import {initializeCli} from "./initialize.cli.js";

export async function craftCli(identifier: string, fragments: ICraftArtifacts) {
    await initializeCli();
    await (new Craft({
        identifier,
        fragments,
    })).start();
}