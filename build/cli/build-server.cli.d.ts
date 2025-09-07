export interface IBuildServerOption {
    prod?: boolean;
}
export declare function buildServerCli({ prod }: IBuildServerOption): Promise<void>;
