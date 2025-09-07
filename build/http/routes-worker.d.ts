import { IBackend, IBackendMethods, IControllableScheme } from "../types/index.js";
export declare class RoutesWorker {
    static readonly availableMethods: IBackendMethods[];
    static find(target: any): IControllableScheme | undefined;
    static expose(backend: IBackend, controller: IControllableScheme): typeof this;
    static load(backend: IBackend, file: string): Promise<IControllableScheme | undefined>;
    static autoload(backend: IBackend, target: string): Promise<typeof this>;
}
