import Fastify from 'fastify';
import { ArcaneEnv } from "@protorians/arcane-core";
import { createMiddleware, Middlewares } from './middleware.js';
import { Plugins } from "./plugin.js";
import path from "node:path";
import { Vauban } from './vauban.js';
import { HMR } from "./hmr.js";
import { Logger } from "./logger.js";
import websocket from '@fastify/websocket';
import { ServerActons } from "./action.js";
import { VaubanUri } from '../common/uri.js';
import { ServerRuntimeMode } from "../enums/server.js";
var activateVerbose = ArcaneEnv.activateVerbose;
var deactivateVerbose = ArcaneEnv.deactivateVerbose;
import { createServer as createViteServer } from 'vite';
import fastifyExpress from "@fastify/express";
import fs from "node:fs";
import { BackendView } from './view.js';
import { RoutesWorker } from "../http/routes-worker.js";
const __filename = import.meta.filename;
export class Backend {
    name;
    _instance;
    _options = {};
    constructor(name) {
        this.name = name;
    }
    get instance() {
        this._instance = this._instance || Fastify({
            logger: false,
        });
        return this._instance;
    }
    get options() {
        this._options = this._options || {};
        this._options.logger = typeof this._options.logger == 'undefined' ? true : this._options.logger;
        this._options.port = typeof this._options.port == 'undefined' ? 3000 : this._options.port;
        return this._options;
    }
    logger(logger) {
        this._options.logger = logger;
        if (this._options.logger)
            activateVerbose();
        else
            deactivateVerbose();
        return this;
    }
    port(port) {
        this._options.port = port;
        return this;
    }
    async start(bootstrapper) {
        await Vauban.initialize();
        Logger.magenta('MODE', Vauban.config.$.mode);
        const isProduction = Vauban.config.$.mode === ServerRuntimeMode.Production;
        const directories = { ...Vauban.directories, ...Vauban.config.$.directories };
        const apiDir = path.join(Vauban.appDir, Vauban.cacheDir, Vauban.config.$.directories?.api || directories.api);
        const viteConfigFile = path.join(Vauban.directory, 'resources', 'vite.config.ts');
        const vite = await createViteServer({
            root: path.resolve(Vauban.appDir, directories.root || ''),
            appType: 'custom',
            server: {
                middlewareMode: true,
                hmr: !isProduction
            },
            configFile: fs.existsSync(viteConfigFile) ? viteConfigFile : undefined
        });
        await this.instance.register(websocket);
        await this.instance.register(fastifyExpress);
        this.instance.use(vite.middlewares);
        if (bootstrapper) {
            await bootstrapper(this);
            Logger.notice('task', 'Bootstrapper Completed!');
        }
        for (const plugin of Plugins.stack.values()) {
            if (plugin.options.route)
                this.instance.all(plugin.options.route.path, async (req, reply) => {
                    if (plugin.options.route?.method?.includes(req.method))
                        plugin.options.route?.callable({ request: req, response: reply });
                });
            if (typeof plugin.options.middleware == 'function')
                Middlewares.use(createMiddleware(plugin.options.name, plugin.options.middleware));
            Logger.highlight('task', plugin.options.name, 'plugins added');
        }
        this.instance.addHook('preHandler', async (req, reply) => {
            await Middlewares.run({ request: req, response: reply });
        });
        if (!isProduction) {
            this.instance.get(VaubanUri.hmrWebSocket, { websocket: true }, async (connection) => HMR.gateway(vite, connection, __filename));
        }
        this.instance.get(VaubanUri.serverActionWebSocket, { websocket: true }, async (connection) => await ServerActons.gateway(connection));
        Logger.highlight('task', 'Deploy API Routes...');
        await RoutesWorker.autoload(this, apiDir);
        this.instance.all('/*', async (req, reply) => {
            const uri = req.raw.url;
            try {
                const view = new BackendView(uri, {
                    server: this,
                    request: req,
                    response: reply,
                });
                if (view.exists) {
                    await view.send(req.params || {});
                    return;
                }
                if (isProduction) {
                    const viewMain = path.join(Vauban.staticViewsDir, uri);
                    if (fs.existsSync(viewMain) && fs.statSync(viewMain).isFile()) {
                        reply.status(200)
                            .type('application/javascript')
                            .send(fs.readFileSync(viewMain));
                    }
                }
                reply.status(404)
                    .type('application/json')
                    .send({ status: false, message: 'NotFound' });
            }
            catch (e) {
                Logger.error('error', e);
                reply.status(500)
                    .send({
                    status: false,
                    message: e.message || e,
                    stack: !isProduction ? e.stack || null : undefined
                });
            }
        });
        this.instance.listen({ port: this.options.port }, (err) => {
            if (err) {
                Logger.error('error', err);
            }
            if (!isProduction)
                HMR.watcher();
            Logger.success('Work', `Ready to < http://localhost:${this.options.port} >`);
        });
        return this;
    }
}
