import Fastify from 'fastify';
import type {
    IBackend,
    IServerBootstrapper,
    IBackendInstance,
    IBackendMethods,
    IBackendOptions,
    IBackendRequest,
    IBackendResponse
} from "../types/index.js";
import {ArcaneEnv} from "@protorians/arcane-core";
import {createMiddleware, Middlewares} from './middleware.js';
import {Plugins} from "./plugin.js";
import path from "node:path";
import {Vauban} from './vauban.js';
import {HMR} from "./hmr.js";
import {Logger} from "./logger.js";
import websocket from '@fastify/websocket';
import {ServerActons} from "./action.js";
import {VaubanUri} from '../common/uri.js';
import {ServerRuntimeMode} from "../enums/server.js";
import activateVerbose = ArcaneEnv.activateVerbose;
import deactivateVerbose = ArcaneEnv.deactivateVerbose;
// import {fastifyStatic} from "@fastify/static";
import {createServer as createViteServer} from 'vite'
import fastifyExpress from "@fastify/express";
import fs from "node:fs";
import {BackendView} from './view.js';

// const __dirname = import.meta.dirname;
const __filename = import.meta.filename;

export class Backend implements IBackend {
    protected _instance: IBackendInstance | undefined;
    protected _options: IBackendOptions = {};

    constructor(public readonly name: string) {
    }

    get instance(): IBackendInstance {
        this._instance = this._instance || Fastify({
            logger: false,
            // logger: this._options.logger,
        });
        return this._instance;
    }

    get options(): IBackendOptions {
        this._options = this._options || {}
        this._options.logger = typeof this._options.logger == 'undefined' ? true : this._options.logger;
        this._options.port = typeof this._options.port == 'undefined' ? 3000 : this._options.port;
        return this._options;
    }

    logger(logger: boolean): this {
        this._options.logger = logger;
        if (this._options.logger) activateVerbose()
        else deactivateVerbose()
        return this;
    }

    port(port: number): this {
        this._options.port = port;
        return this;
    }

    async start(bootstrapper?: IServerBootstrapper): Promise<typeof this> {
        await Vauban.initialize();

        Logger.magenta('MODE', process.argv, Vauban.config.$.mode)

        const isProduction: boolean = Vauban.config.$.mode === ServerRuntimeMode.Production;
        const directories = Vauban.directories;
        const viteConfigFile = path.join(Vauban.directory, 'resources', 'vite.config.ts')
        const vite = await createViteServer({
            root: path.resolve(Vauban.appDir, directories.source || ''),
            appType: 'custom',
            server: {
                middlewareMode: true,
                hmr: !isProduction
            },
            configFile: fs.existsSync(viteConfigFile) ? viteConfigFile : undefined
        })


        /**
         * Registry socket
         */
        await this.instance.register(websocket);

        /**
         * Registry Express Capabilities
         */
        await this.instance.register(fastifyExpress)
        this.instance.use(vite.middlewares)

        /**
         * Launch Bootstrapper
         */
        if (bootstrapper) {
            await bootstrapper(this);
            Logger.notice('task', 'Bootstrapper Completed!');
        }

        /**
         * Add plugins
         */
        for (const plugin of Plugins.stack.values()) {
            if (plugin.options.route)
                this.instance.all(plugin.options.route.path, async (req, reply) => {
                    if (plugin.options.route?.method?.includes(req.method as IBackendMethods))
                        plugin.options.route?.callable({request: req, response: reply})
                });

            if (typeof plugin.options.middleware == 'function')
                Middlewares.use(createMiddleware(plugin.options.name, plugin.options.middleware))

            Logger.highlight('task', plugin.options.name, 'plugins added')
        }


        /**
         * Add middlewares
         */
        this.instance.addHook('preHandler', async (req: IBackendRequest, reply: IBackendResponse) => {
            await Middlewares.run({request: req, response: reply});
        });


        /**
         * @Route HMR sockets
         */
        if (!isProduction) {
            this.instance.get(VaubanUri.hmrWebSocket, {websocket: true}, async (connection,) =>
                HMR.gateway(vite, connection, __filename)
            );
        }


        /**
         * @Route Server Actions sockets
         */
        this.instance.get(VaubanUri.serverActionWebSocket, {websocket: true}, async (connection,) =>
            await ServerActons.gateway(connection)
        );


        /**
         * @Route Server side rendering VIEWS
         */
        this.instance.get('/*', async (req, reply) => {
            const uri = req.raw.url!;
            try {

                /** View File treatment */
                const view = new BackendView(uri, {
                    server: this,
                    request: req,
                    response: reply,
                })

                if (view.exists) {
                    await view.send(req.params || {})
                    return;
                }

                /** View JSMain */
                if (isProduction) {
                    const viewMain = path.join(Vauban.staticViewsDir, uri)
                    if (fs.existsSync(viewMain) && fs.statSync(viewMain).isFile()) {
                        reply.status(200)
                            .type('application/javascript')
                            .send(fs.readFileSync(viewMain));
                    }
                }


                reply.status(404)
                    .type('application/json')
                    .send({status: false, message: 'No work found', uri});

            } catch (e: any) {
                Logger.error('error', e)
                reply.status(500)
                    .send({status: false, cause: e.message || e.stack || e});
            }

        })


        /**
         * Start server
         */
        this.instance.listen({port: this.options.port}, (err) => {
            if (err) {
                Logger.error('error', err);
                process.exit(1);
            }

            if (!isProduction) HMR.watcher()

            /**
             * Notice
             */
            Logger.success('Work', `Ready to < http://localhost:${this.options.port} >`)
        });

        return this;
    }
}