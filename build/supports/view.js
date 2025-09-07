import path from "node:path";
import { Vauban } from "./vauban.js";
import fs from "node:fs";
import { Presets } from "./presets.js";
import { ViewFragment } from "../enums/view.js";
import { BackendException } from "./exception.js";
import { FileManager } from "./fs.js";
import { HMR } from "./hmr.js";
import { ContextWidget, WidgetBuilder } from "@protorians/widgets";
import { ServerRuntimeMode } from "../enums/server.js";
import { VaubanUri } from "../common/uri.js";
import { Logger } from "./logger.js";
export class BackendView {
    id;
    _options;
    uri;
    filename;
    pathname;
    dirname;
    basename;
    code = '';
    constructor(id, _options = {}) {
        this.id = id;
        this._options = _options;
        this._options.extension = this._options.extension || '.js';
        this.uri = `${id?.toString().endsWith('/') ? `${id}${ViewFragment.Index}` : id}`;
        this.filename = `${this.uri}${this._options.extension}`;
        this.pathname = path.join(BackendView.directory, this.filename);
        this.dirname = path.dirname(this.pathname);
        this.basename = path.basename(this.pathname);
    }
    get options() {
        return this._options || {};
    }
    get exists() {
        return fs.existsSync(this.pathname);
    }
    path(name) {
        name = name.toString().replace(/[\/\\]/g, '');
        return path.join(BackendView.directory, this.id, `${name}${this._options.extension}`);
    }
    async send(params) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.code.trim().length)
                    await this.render(params);
                fs.writeFile(path.join(this.dirname, 'index.html'), this.code, { encoding: "utf8" }, (err) => {
                    if (err)
                        Logger.error('View', 'failed to create view support');
                });
                this.options
                    .response
                    ?.type('text/html')
                    .status(200)
                    .send(this.code);
                resolve(this.code);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async import() {
        return new Promise(async (resolve, reject) => {
            try {
                const mod = await HMR.import(this.pathname);
                if (mod)
                    resolve(mod);
                else
                    reject(undefined);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    async mockup() {
        const mockupFile = this.path(ViewFragment.Mockup);
        if (!fs.existsSync(mockupFile)) {
            throw new BackendException(`Mockup not found`);
        }
        const mod = await HMR.import(mockupFile);
        if (typeof mod === 'undefined') {
            throw new BackendException(`Mockup Module not found`);
        }
        if (typeof mod.default !== 'function') {
            throw new BackendException(`Mockup has not a main function`);
        }
        return mod;
    }
    async build(content) {
        const mockup = await (await this.mockup()).default(`<vauban-view style="opacity:0;">${content}</vauban-view>`);
        const isProduction = Vauban.config.$.mode === ServerRuntimeMode.Production;
        this.code = mockup
            .replace(/{{Vauban.Requirement.Head}}/gi, [
            `<meta vauban:client name="config:host" content="${Vauban.config.$.host}" />`,
            `<meta vauban:client name="config:port" content="${Vauban.config.$.port}" />`,
        ].join(isProduction ? '' : '\n'))
            .replace(/{{Vauban.Requirement.Body}}/gi, [
            !isProduction
                ? `<script type="module" vauban:view="${this.id}" src="${this.path(ViewFragment.Main)}"></script>`
                : `<script type="module" vauban:view="${this.id}" src="./${ViewFragment.Main}.js"></script>`,
            !isProduction
                ? `<script type="module">const m = "message", e = "addEventListener"; (new WebSocket('ws://${this.options.server?.options.host || 'localhost'}:${this.options.server?.options.port || '80'}${VaubanUri.hmrWebSocket}'))[e](m, e =>{ e = JSON.parse(e.data||'{}'); (typeof e.type === 'string' && typeof e.file === 'string' && e.type === "hmr") ? window.location.reload() : void(0); }) </script>`
                : ''
        ].join(''));
        return this.code;
    }
    async render(params) {
        BackendView.createMain(this.path(ViewFragment.Main), this.basename);
        const view = await this.import().catch(err => {
            throw new BackendException(err || `View not found`);
        });
        if (typeof view.default !== 'function') {
            throw new BackendException(`View has not a main function`);
        }
        const states = {};
        const props = params;
        const widget = view.default.construct(props);
        if (typeof widget === 'undefined') {
            throw new BackendException(`No widget rendered`);
        }
        const context = new ContextWidget(widget, props, states);
        context.root = widget;
        WidgetBuilder(widget, context);
        const rendering = (await widget.serverElement?.render()) || '';
        await this.build(rendering);
        return this.code;
    }
    async file(name) {
        const file = this.path(name);
        if (!fs.existsSync(file))
            throw new BackendException(`Fragment < ${file} > not found`);
        return await HMR.import(file);
    }
    async fragment(name) {
        return await this.file(name.toString());
    }
    static get directory() {
        const directories = { ...Vauban.directories, ...(Vauban.config.$?.directories || {}) };
        return path.join(Vauban.appDir, Vauban.cacheDir, directories.views);
    }
    static createMain(output, basename) {
        FileManager.create(output, this.preset(basename || 'index.js'));
        return this;
    }
    static preset(basename) {
        return Presets.view().toString()
            .replace(/'view:import';/gi, `import view from "./${basename}";`)
            .replace(/'view:bootstrapper'/gi, `view.construct({})`);
    }
}
