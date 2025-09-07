import { ViewWidget } from "@protorians/widgets";
import { BuildOptions } from "esbuild";
export type IModularDefaultSource = {
    readonly default: (...args: any[]) => any;
    [K: string]: any;
};
export type IModularView = {
    readonly default: typeof ViewWidget;
    [K: string]: any;
};
export type IHMRCompilate = BuildOptions & {
    outfile: string;
};
