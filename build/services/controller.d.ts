import { IServerPayload } from "../types/index.js";
export declare class ServiceController {
    static run(uri: string, { response }: IServerPayload): Promise<void>;
}
