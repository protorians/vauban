import { TSConfig, Vauban } from "../supports/index.js";
import { ArcaneEnv } from "@protorians/arcane-core";
var activateVerbose = ArcaneEnv.activateVerbose;
export async function initializeCli() {
    TSConfig.initialize();
    activateVerbose();
    await Vauban.initialize();
}
