import {TSConfig, Vauban} from "../supports/index.js";
import {ArcaneEnv} from "@protorians/arcane-core";
import activateVerbose = ArcaneEnv.activateVerbose;

export async function initializeCli(): Promise<void> {
    TSConfig.initialize();
    activateVerbose();
    await Vauban.initialize();
}