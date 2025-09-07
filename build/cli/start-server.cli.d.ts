export interface IStartServerOption {
    prod?: boolean;
}
export declare function startServerCli({ prod }: IStartServerOption): Promise<void>;
