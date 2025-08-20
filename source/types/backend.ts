import type {ICollectionScheme, ISignalStack, ISignalStackCallable} from "@protorians/core";
import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {ServerRuntimeMode} from "../enums/server.js";

export interface IBackendInstance extends FastifyInstance {
}

export interface IBackendRequest extends FastifyRequest {
}

export interface IBackendResponse extends FastifyReply {
}

export interface IBackendOptions {
    logger?: boolean;
    port?: number;
    host?: string;
}

export interface IBackendIncomingPayload {
    request: IBackendRequest;
    response: IBackendResponse;
}

export interface IBackendSignalMap {

}

export type IBackendSignal = ISignalStack<IBackendSignalMap>

export type IBackendSignalCallable = ISignalStackCallable<IBackendSignalMap>

export type IBackendMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface IBackendDirectories {
    public: string;
    root: string;
    actions: string;
    api: string;
    assets: string;
    images: string;
    fonts: string;
    css: string;
    videos: string;
    sounds: string;
    svg: string;
    configs: string;
    database: string;
    entities: string;
    factories: string;
    migrations: string;
    repositories: string;
    // schemas: string;
    seeders: string;
    components: string;
    helpers: string;
    payloads: string;
    services: string;
    themes: string;
    views: string;
    enums: string;
    types: string;
}

export type IBackendDirectoriesKeys =
    'api'
    | 'action'
    | 'component'
    | 'config'
    | 'helper'
    | 'service'
    | 'view'
    | 'theme'
    | 'entity'
    | 'factory'
    | 'migration'
    | 'repository'
    | 'seeder'
    | 'enum';

export interface IBackendConfig extends ICollectionScheme {
    name?: string;
    title?: string;
    host?: string;
    port?: number;
    mode?: ServerRuntimeMode;
    directories?: Partial<IBackendDirectories>;
}

export interface IBackend {
    get instance(): IBackendInstance;

    get options(): IBackendOptions;

    logger(logger: boolean): this;

    port(port: number): this;

    start(bootstrapper?: IServerBootstrapper): Promise<this>;
}

export type IServerBootstrapper = (bootstrapper?: IBackend) => Promise<void>;

export type IServerPayload = {
    server: IBackend;
    request: FastifyRequest;
    response: IBackendResponse;
}

export interface IBackendCraftingTemplate {
    filename: string;
    directory: string;
    code: string;
}