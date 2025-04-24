import Fastify from 'fastify';
import type {
    IServer,
    IServerBootstrapper,
    IServerInstance,
    IServerMethods,
    IServerOptions,
    IServerRequest,
    IServerResponse
} from "../types/index.js";
import {ArcaneEnv} from "@protorians/arcane-core";
import {createMiddleware, Middlewares} from './middleware.js';
import {Plugins} from "./plugin.js";
import path from "node:path";
import {Vauban} from './vauban.js';
import {HMR} from "./hmr.js";
import {DirectoryManager} from "./fs.js";
import {Logger} from "./logger.js";
import websocket from '@fastify/websocket';
import {ServerActons} from "./action.js";
import {VaubanUri} from '../common/uri.js';
import {ServerRuntimeMode} from "../enums/server.js";
import activateVerbose = ArcaneEnv.activateVerbose;
import deactivateVerbose = ArcaneEnv.deactivateVerbose;
import {fastifyStatic} from "@fastify/static";
import {createServer as createViteServer} from 'vite'
import fastifyExpress from "@fastify/express";
import fs from "node:fs";
import {VirtualView} from './view.js';

// const __dirname = import.meta.dirname;
const __filename = import.meta.filename;

export class VaubanServer implements IServer {
    protected _instance: IServerInstance | undefined;
    protected _options: IServerOptions = {};

    constructor(public readonly name: string) {
    }

    get instance(): IServerInstance {
        this._instance = this._instance || Fastify({
            logger: false,
            // logger: this._options.logger,
        });
        return this._instance;
    }

    get options(): IServerOptions {
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

        const isProduction: boolean = Vauban.config.$.mode === ServerRuntimeMode.Production;
        const directories = Vauban.directories;
        const cacheDir = Vauban.workDir;
        // const viewDir = path.join(Vauban.workDir, Vauban.buildDir, directories.views || './source/views');
        // const pipelineDir = path.join(cacheDir, 'pipeline');
        const cacheViewsDir = path.join(cacheDir, 'views');

        const viteConfigFile = path.join(Vauban.directory, 'resources', 'vite.config.ts')
        const vite = await createViteServer({
            root: path.resolve(Vauban.appDir, directories.source || ''),
            appType: 'custom',
            server: {
                middlewareMode: true,
            },
            configFile: fs.existsSync(viteConfigFile) ? viteConfigFile : undefined
        })


        /**
         * Initialize directories
         */
        // DirectoryManager.create(pipelineDir);
        DirectoryManager.create(cacheViewsDir);

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
            Logger.notice('Bootstrap', 'Completed!');
        }

        /**
         * Add plugins
         */
        for (const plugin of Plugins.stack.values()) {
            if (plugin.options.route)
                this.instance.all(plugin.options.route.path, async (req, reply) => {
                    if (plugin.options.route?.method?.includes(req.method as IServerMethods))
                        plugin.options.route?.callable({request: req, response: reply})
                });

            if (typeof plugin.options.middleware == 'function')
                Middlewares.use(createMiddleware(plugin.options.name, plugin.options.middleware))

            Logger.highlight('Plugin', plugin.options.name, 'added')
        }


        /**
         * Add middlewares
         */
        this.instance.addHook('preHandler', async (req: IServerRequest, reply: IServerResponse) => {
            await Middlewares.run({request: req, response: reply});
        });


        /**
         * @prod
         */
        if (isProduction) {
            this.instance.register(fastifyStatic, {
                root: path.join(Vauban.appDir, Vauban.cacheDir),
                prefix: '/'
            })
        }

        /**
         * @dev
         */
        if (!isProduction) {
            // this.instance.register(fastifyStatic, {
            //     root: path.join(Vauban.workDir, Vauban.buildDir),
            //     prefix: '/'
            // })
        }

        /**
         * @Route Server side rendering VIEWS
         */
        this.instance.get('/*', async (req, reply) => {
            const uri = req.raw.url!;
            try {

                /**
                 * View File treatment
                 */
                const view = new VirtualView(uri, {
                    server: this,
                    request: req,
                    response: reply,
                })

                if (view.exists) {
                    await view.send(req.params || {})
                }

                reply.status(404)
                    .type('application/json')
                    .send({status: false, message: 'No work found', uri});

            } catch (e: any) {
                Logger.error('Server', e)
                reply.status(500)
                    .send({status: false, cause: e.message || e.stack || e});
            }

        })

        /**
         * @Socket HMR sockets
         */
        if (!isProduction) {
            this.instance.get(VaubanUri.hmrWebSocket, {websocket: true}, async (connection,) => {
                const socket = connection;
                vite.watcher.on('change', async (file) => {
                    if (file !== __filename && file.endsWith('.js')) {
                        await HMR.replace(file)
                        socket.send(JSON.stringify({type: 'hmr', action: 'reload', file,}))
                    }
                })
            });
        }

        /**
         * @Socket Server Actions sockets
         */
        this.instance.get(VaubanUri.serverActionWebSocket, {websocket: true}, async (connection,) => {
            const socket = connection;
            const actions = await ServerActons.getActions();

            socket.on('message', async (msg: any) => {
                try {
                    const parsed = JSON.parse(msg.toString());
                    if (typeof actions === 'undefined') return;
                    if (parsed.type !== 'action') return;

                    const {name, payload, requestId} = parsed;
                    const explode = name.split(':')
                    const action = actions?.get(name);

                    if (!action) {
                        socket.send(JSON.stringify({
                            type: 'error',
                            error: `Action "${explode[1] || explode[0]}" not found.`,
                            requestId,
                        }))
                        return;
                    }
                    const result = await action(payload);
                    socket.send(JSON.stringify({
                        type: 'response',
                        name,
                        result,
                        requestId,
                    }));
                } catch (err) {
                    socket.send(JSON.stringify({
                        type: 'error',
                        error: (err as Error).message,
                    }));
                }
            });


        });


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
            Logger.success('Server', `Ready to < http://localhost:${this.options.port} >`)
        });

        return this;
    }
}