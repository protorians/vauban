import path from "node:path";
import {Vauban} from "./vauban.js";
import fs from "node:fs";
import {Presets} from "./presets.js";
import {IVaubanViewOptions} from "../types/view.js";
import {ViewFragment} from "../enums/view.js";
import {VaubanException} from "./exception.js";
import {FileManager} from "./fs.js";
import {HMR} from "./hmr.js";
import type {IModularDefaultSource, IModularView} from "../types/index.js";
import {ContextWidget, WidgetBuilder} from "@protorians/widgets";
import {ServerRuntimeMode} from "../enums/server.js";
import {VaubanUri} from "../common/uri.js";
import {Logger} from "./logger.js";


export class VirtualView {

    readonly uri: string;
    readonly filename: string;
    readonly pathname: string;
    readonly dirname: string;
    readonly basename: string;
    protected code: string = '';

    constructor(
        public readonly id: string,
        protected _options: Partial<IVaubanViewOptions> = {},
    ) {
        this._options.extension = this._options.extension || '.js';

        this.uri = `${id?.toString().endsWith('/') ? `${id}${ViewFragment.Index}` : id}`
        this.filename = `${this.uri}${this._options.extension}`
        this.pathname = path.join(VirtualView.directory, this.filename);
        this.dirname = path.dirname(this.pathname);
        this.basename = path.basename(this.pathname);
        // this.mainFile = path.join(VirtualView.directory, `${id?.toString().endsWith('/') ? `${id}${ViewFragment.Index}` : id}.main${this._options.extension}`)
    }

    get options(): Partial<Readonly<IVaubanViewOptions>> {
        return this._options || {};
    }

    get exists(): boolean {
        return fs.existsSync(this.pathname)
    }

    path(name: string | ViewFragment): string {
        name = name.toString().replace(/[\/\\]/g, '');
        return path.join(VirtualView.directory, this.id, `${name}${this._options.extension}`);
    }

    preset(): string {
        return Presets.view().toString()
            .replace(/'view:import';/gi, `import view from "./${this.basename}";`)
            .replace(/'view:bootstrapper'/gi, `view.construct({})`)
    }

    createMain(): this {
        const file = this.path(ViewFragment.Main);
        FileManager.create(file, this.preset())
        return this;
    }

    async send<T extends Record<any, any>>(params: T): Promise<void> {
        if (!this.code.trim().length) await this.render(params)

        fs.writeFile(
            path.join(this.dirname, 'index.html'),
            this.code,
            {encoding: "utf8"},
            (err) => {
                if (err) Logger.error('View', 'failed to create view support')
            }
        )

        this.options
            .response
            ?.type('text/html')
            .status(200)
            .send(this.code);
    }

    async import() {
        return await HMR.import<IModularView>(this.pathname);
    }

    async mockup(): Promise<IModularDefaultSource> {
        const mockupFile = this.path(ViewFragment.Mockup);
        if (!fs.existsSync(mockupFile)) {
            throw new VaubanException(`Mockup not found`);
        }

        const mod = await HMR.import<IModularDefaultSource>(mockupFile);
        if (typeof mod === 'undefined') {
            throw new VaubanException(`Mockup Module not found`);
        }
        if (typeof mod.default !== 'function') {
            throw new VaubanException(`Mockup has not a main function`);
        }
        return mod;
    }

    async render<T extends Record<any, any>>(params: T): Promise<string> {
        this.createMain()

        const view = await this.import();

        if (typeof view === 'undefined') {
            throw new VaubanException(`View not found`);
        }

        if (typeof view.default !== 'function') {
            throw new VaubanException(`View has not a main function`);
        }


        const states = {} as any;
        const props = params;
        const widget = view.default.construct(props as Object);

        if (typeof widget === 'undefined') {
            throw new VaubanException(`No widget rendered`);
        }

        const context = new ContextWidget<any, any>(widget, props, states)
        context.root = widget;
        WidgetBuilder(widget, context);
        const rendering = (await widget.serverElement?.render()) || '';
        const mockup: string = await (await this.mockup()).default(`<vauban-view style="opacity:0;">${rendering}</vauban-view>`);

        const isProduction: boolean = Vauban.config.$.mode === ServerRuntimeMode.Production;

        this.code = mockup
            .replace(/{{Vauban.Requirement.Head}}/gi, [
                `<meta vauban:client name="config:host" content="${Vauban.config.$.host}" />`,
                `<meta vauban:client name="config:port" content="${Vauban.config.$.port}" />`,
            ].join(isProduction ? '' : '\n'))
            .replace(
                /{{Vauban.Requirement.Body}}/gi,
                [
                    `<script type="module" vauban:view="${this.id}" src="${this.path(ViewFragment.Main)}"></script>`,
                    !isProduction
                        ? `<script type="module">const m = "message", e = "addEventListener"; (new WebSocket('ws://localhost:${this.options.server?.options.port}${VaubanUri.hmrWebSocket}'))[e](m, e =>{ e = JSON.parse(e.data||'{}'); (typeof e.type === 'string' && typeof e.file === 'string' && e.type === "hmr") ? history.go(0) : void(0); }) </script>` : ''
                ].join('')
            );

        return this.code;
    }

    async file<T>(name: string): Promise<T> {
        const file = this.path(name);
        if (!fs.existsSync(file)) throw new VaubanException(`Fragment < ${file} > not found`)
        return await import(file);
    }

    async fragment<T>(name: ViewFragment): Promise<T> {
        return await this.file<T>(name.toString())
    }


    static get directory(): string {
        return path.join(Vauban.appDir, Vauban.cacheDir, Vauban.directories.views!)
    }

}