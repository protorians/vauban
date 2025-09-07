import { CraftArtifact } from "../enums/craft.js";
export type ICraftArtifacts = {
    [K in CraftArtifact]: boolean;
};
export interface ICraftOptions {
    identifier: string;
    fragments: ICraftArtifacts;
}
export interface ICraft {
    get options(): ICraftOptions;
}
