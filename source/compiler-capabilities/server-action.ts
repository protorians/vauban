import fs from 'node:fs'
import path from "node:path";
import {Plugin as EsBuildPlugin} from 'esbuild'
import {Plugin as VitePlugin} from 'vite'
import {Vauban} from '../supports/vauban.js';
import {ServerActons} from "../supports/index.js";
import {createHash} from "node:crypto";

const __dirname = import.meta.dirname;
let manifest: Record<string, string>;


export function sawsVitePlugin(): VitePlugin {
    manifest = ServerActons.manifest()

    return {
        name: 'vite-plugin-vauban-saws',
        enforce: 'pre',
        async transform(source, id) {
            source = source.toString().trim()

            if (
                source.startsWith('"use server"') ||
                source.startsWith("'use server'")
            ) {
                if (id.endsWith('.js') || id.endsWith('.ts')) {
                    const exportRegex = /^export\s+(async\s+)?function\s+(\w+)\s*\(/gm
                    const matches = [...source.matchAll(exportRegex)]

                    if (matches.length === 0) return;

                    const key = createHash('sha256').update(id).digest('hex').toString()
                    const actions = matches.map(m => m[2])

                    actions.forEach(fnName => manifest[`${key}:${fnName}`] = path.relative(Vauban.appDir, id))

                    const transformed = actions.map(fnName => `export async function ${fnName}(...a) { return new Promise((s, r) => ActionDriver.action("${key}:${fnName}", ...a).then((r) => s(r.result)).catch(err => r(err)) ) }`)
                        .join('\n')
                    const driver = path.join(__dirname, '../clients', 'action-driver.js')

                    ServerActons.update(manifest);
                    return {
                        code: `import {ActionDriver} from "${driver}";\n${transformed}`
                    }
                }

            }

            return;
        },

    }

}

export function serverActionWebSocketPlugin(): EsBuildPlugin {
    manifest = ServerActons.manifest()

    return {
        name: 'vauban-server-action-plugin',
        setup(build) {
            build.onLoad({filter: /\.(ts|js)$/}, async (args) => {
                const source = fs.readFileSync(args.path, 'utf8')

                if (!source.includes('"use server"') && !source.includes("'use server'")) {
                    return;
                }

                const exportRegex = /^export\s+(async\s+)?function\s+(\w+)\s*\(/gm
                const matches = [...source.matchAll(exportRegex)]
                if (matches.length === 0) return

                const actions = matches.map(m => m[2])
                actions.forEach(fnName => manifest[fnName] = path.relative(Vauban.appDir, args.path))

                const transformed = actions.map(fnName => `
export async function ${fnName}(...a) { return new Promise((suc, rej) => ActionDriver.action("${fnName}", ...a).then((r) => suc(r.result)).catch(err => rej(err)) ) }`)
                    .join('\n')

                return {
                    contents: `import {ActionDriver} from "${path.join(__dirname, '../clients', 'action-driver.js')}";\n${transformed}`,
                    loader: path.extname(args.path).slice(1) as 'ts' | 'js',
                }
            })

            build.onEnd(async () => {
                ServerActons.update(manifest);
            })
        }
    }
}
