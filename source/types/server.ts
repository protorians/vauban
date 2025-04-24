import type {ICollectionScheme, ISignalStack, ISignalStackCallable} from "@protorians/core";
import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {ServerRuntimeMode} from "../enums/server.js";

export interface IServerInstance extends FastifyInstance {
}

export interface IServerRequest extends FastifyRequest {
}

export interface IServerResponse extends FastifyReply {
}

export interface IServerOptions {
    logger?: boolean;
    port?: number;
}

export interface IServerIncomingPayload {
    request: IServerRequest;
    response: IServerResponse;
}

export interface IServerSignalMap {

}

export type IServerSignal = ISignalStack<IServerSignalMap>

export type IServerSignalCallable = ISignalStackCallable<IServerSignalMap>

export type IServerMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface IServerDirectories {
    public: string;
    source: string;
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
    schemas: string;
    seeders: string;
    components: string;
    helpers: string;
    payloads: string;
    services: string;
    themes: string;
    views: string;
}

export interface IServerConfig extends ICollectionScheme {
    name?: string;
    title?: string;
    host?: string;
    port?: number;
    mode?: ServerRuntimeMode;
    directories?: Partial<IServerDirectories>;
}

export interface IServer {
    get instance(): IServerInstance;

    get options(): IServerOptions;

    logger(logger: boolean): this;

    port(port: number): this;

    start(bootstrapper?: IServerBootstrapper): Promise<this>;
}

export type IServerBootstrapper = (bootstrapper?: IServer) => Promise<void>;

export type IServerPayload = {
    server: IServer;
    request: FastifyRequest;
    response: IServerResponse;
}