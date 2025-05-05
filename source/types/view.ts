import { IServerPayload } from "./backend.js";
import {ViewFragment} from "../enums/view.js";
import {IModularDefaultSource, IModularView} from "./module.js";

export interface IBackendViewOptions extends Partial<IServerPayload> {
    extension?: string;
}

export interface IBackendView {
    /**
     * Resource path on server
     */
    readonly uri: string;

    /**
     * Full filename with extension
     */
    readonly filename: string;

    /**
     * Full pathname on server
     */
    readonly pathname: string;

    /**
     * Dirname of file path on server
     */
    readonly dirname: string;

    /**
     * File basename
     */
    readonly basename: string;

    /**
     * Current options
     */
    get options(): Partial<Readonly<IBackendViewOptions>>;

    /**
     * Check if file exists on server
     */
    get exists(): boolean;

    /**
     * Return file full path on server with same directory that the view like restriction
     * @param name
     */
    path(name: string | ViewFragment): string;

    /**
     * Send to server response
     * @param params
     */
    send<T extends Record<any, any>>(params: T): Promise<string>;

    /**
     * Import view module
     */
    import(): Promise<IModularView>;

    /**
     * Get view mockup if existe
     */
    mockup(): Promise<IModularDefaultSource>;

    /**
     * Build HTML code
     * @param content
     */
    build(content: string): Promise<string>;

    /**
     * View rendering
     * @param params
     */
    render<T extends Record<any, any>>(params: T): Promise<string>;

    /**
     * Import file on server with same directory that the view like restriction
     * @param name file name
     */
    file<T>(name: string): Promise<T | undefined>;

    /**
     * Import file in the list of `ViewFragment`
     * @param name
     */
    fragment<T>(name: ViewFragment): Promise<T | undefined>;
}