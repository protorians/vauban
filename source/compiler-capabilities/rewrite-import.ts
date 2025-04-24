import {Vauban} from "../supports/index.js";
import {init, parse} from 'es-module-lexer';
import path from "node:path";
import {VaubanUri} from "../common/uri.js";

(async () => await init)()

function rewritePath(importPath: string, importerFile: string): string {
    // Alias
    if (importPath.startsWith('@/')) {
        return importPath.replace('@/', '/@src/');
    }

    if (/^[^./]/.test(importPath)) {
        return `${VaubanUri.packages}/${importPath}`;
    }

    const importerDir = path.dirname(importerFile);
    const absolutePath = path.resolve(importerDir, importPath);
    const projectRoot = Vauban.appDir || process.cwd();
    const relativeToRoot = path.relative(projectRoot, absolutePath).replace(/\\/g, '/');

    return `${VaubanUri.fileSystem}/${relativeToRoot}`;
}


export async function rewriteImportCapability(code: string, importerPath: string) {
    const [imports] = parse(code);
    let result = '';
    let lastIndex = 0;

    for (const imp of imports) {
        result += code.slice(lastIndex, imp.s);
        const raw = code.slice(imp.s, imp.e);

        const rewritten = rewritePath(raw, importerPath);
        result += rewritten;
        lastIndex = imp.e;
    }

    result += code.slice(lastIndex);
    return result;
}