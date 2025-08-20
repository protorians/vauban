import {BackendMapper} from "../supports/backend.mapper.js";
import {HMR, Logger} from "../supports/index.js";
import {IBackend, IBackendMethods, IControllable, IControllableScheme} from "../types/index.js";
import {ControllableScheme, RoutableScheme} from "./routes-scheme.js";
import {BackendException} from "../supports/exception.js";


export class RoutesWorker {

    static readonly availableMethods: IBackendMethods[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    static find(target: any): IControllableScheme | undefined {
        for (const controller of ControllableScheme.values())
            if (controller.target === target)
                return controller;
        return undefined;
    }

    static expose(backend: IBackend, controller: IControllableScheme): typeof this {
        const baseUri = `${controller.pathname}`;
        // const isProduction: boolean = Vauban.config.$.mode === ServerRuntimeMode.Production;

        for (const route of controller.routes) {
            let uri = `${baseUri}${route.props.path}`;
            uri = uri.endsWith("/") ? uri.slice(0, -1) : uri;

            if (this.availableMethods.includes(route.props.method)) {
                const method = route.props.method.toString().toLowerCase();

                backend.instance[method](uri, async (request: any, response: any) => {
                    try {
                        const params = {...(request.params || {})};

                        /**
                         * Validate Payload
                         */
                        if (route.props.payload) {
                            for (const [key, scheme] of Object.entries(route.props.payload)) {
                                if (typeof scheme === 'object' && typeof scheme.validate === 'function' && scheme.validate(params[key]) === false) {
                                    throw new BackendException('Invalid payload');
                                }
                            }
                        }


                        const instance = new route.target() as IControllable;
                        instance.useResponse(response).useRequest(request);

                        const render = typeof instance[route.key] === 'function'
                            ? instance[route.key]({...params})
                            : undefined;

                        response
                            .status(route.props.status || 200)
                            .type(route.props.type || 'application/json')
                            .send(render instanceof Promise ? await render : render);
                    } catch (e: any) {
                        Logger.error('error', e)
                        response.status(500)
                            .send({
                                status: false,
                                message: e.message || 'unkwnon',
                                // stack: !isProduction ? e.stack : undefined,
                            });

                    }
                })
            }
        }

        return this;
    }


    static async load(backend: IBackend, file: string) {
        if (file.endsWith('.js')) {
            const mod = await HMR.replace<any>(file);
            const klass = mod.default || Object.values(mod)[0] || undefined;
            const controller = this.find(klass);

            if (controller) this.expose(backend, controller);

            return controller;
        }

        return undefined;
    }

    static async autoload(backend: IBackend, target: string): Promise<typeof this> {
        ControllableScheme.clear();
        RoutableScheme.clear();

        await BackendMapper.scan(target, (file: string) => {
            return new Promise<void>(async (resolve) => {
                await this.load(backend, file);
                resolve();
            })
        });

        return this;
    }


}