import { Craft } from "../supports/craft.js";
import { initializeCli } from "./initialize.cli.js";
export async function craftCli(identifier, fragments) {
    await initializeCli();
    await (new Craft({
        identifier,
        fragments,
    })).start();
}
