import { BackendMapper } from "../supports/backend.mapper.js";
import { HMR, Logger } from "../supports/index.js";
import { ControllableScheme, RoutableScheme } from "./routes-scheme.js";
import { BackendException } from "../supports/exception.js";
export class RoutesWorker {
    static availableMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    static find(target) {
        for (const controller of ControllableScheme.values())
            if (controller.target === target)
                return controller;
        return undefined;
    }
    static expose(backend, controller) {
        const baseUri = `${controller.pathname}`;
        for (const route of controller.routes) {
            let uri = `${baseUri}${route.props.path}`;
            uri = uri.endsWith("/") ? uri.slice(0, -1) : uri;
            if (this.availableMethods.includes(route.props.method)) {
                const method = route.props.method.toString().toLowerCase();
                backend.instance[method](uri, async (request, response) => {
                    try {
                        const params = { ...(request.params || {}) };
                        if (route.props.payload) {
                            for (const [key, scheme] of Object.entries(route.props.payload)) {
                                if (typeof scheme === 'object' && typeof scheme.validate === 'function' && scheme.validate(params[key]) === false) {
                                    throw new BackendException('Invalid payload');
                                }
                            }
                        }
                        const instance = new route.target();
                        instance.useResponse(response).useRequest(request);
                        const render = typeof instance[route.key] === 'function'
                            ? instance[route.key]({ ...params })
                            : undefined;
                        response
                            .status(route.props.status || 200)
                            .type(route.props.type || 'application/json')
                            .send(render instanceof Promise ? await render : render);
                    }
                    catch (e) {
                        Logger.error('error', e);
                        response.status(500)
                            .send({
                            status: false,
                            message: e.message || 'unkwnon',
                        });
                    }
                });
            }
        }
        return this;
    }
    static async load(backend, file) {
        if (file.endsWith('.js')) {
            const mod = await HMR.replace(file);
            const klass = mod.default || Object.values(mod)[0] || undefined;
            const controller = this.find(klass);
            if (controller)
                this.expose(backend, controller);
            return controller;
        }
        return undefined;
    }
    static async autoload(backend, target) {
        ControllableScheme.clear();
        RoutableScheme.clear();
        await BackendMapper.scan(target, (file) => {
            return new Promise(async (resolve) => {
                await this.load(backend, file);
                resolve();
            });
        });
        return this;
    }
}
