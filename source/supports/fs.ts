import * as fs from "node:fs";
import path from "node:path";
import {Vauban} from "./vauban.js";


export class DirectoryManager {

    static create(directory: string) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {recursive: true});
        }
        if (!fs.statSync(directory).isDirectory()) {
            fs.mkdirSync(directory, {recursive: true});
        }
        return this;
    }

    static remove(directory: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                if (directory !== Vauban.appDir && directory !== Vauban.directory && fs.existsSync(directory)) {
                    fs.rmSync(directory, {recursive: true, force: true});
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        })
    }


    static prune(directory: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                if (directory !== Vauban.appDir && directory !== Vauban.directory && fs.existsSync(directory)) {
                    fs.rmSync(directory, {recursive: true, force: true});
                    fs.mkdirSync(directory, {recursive: true});
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        })
    }

    static scan(
        directory: string,
        options?: {
            encoding: BufferEncoding | null,
            withFileTypes?: false | undefined,
            recursive?: boolean | undefined
        } | BufferEncoding | null,
        callback?: (file: string) => void): string[] {
        if (!fs.existsSync(directory)) return [];
        if (!fs.statSync(directory).isDirectory()) return [];

        let files: string[] = [];
        for (const file of fs.readdirSync(directory, options)) {
            const filepath = path.join(directory, file);
            if (fs.statSync(filepath).isDirectory()) {
                files = [...files, ...this.scan(filepath, options, callback)]
            } else {
                files.push(file);
                if (callback) callback(filepath);
            }
        }

        return files;
    }

}


export class FileManager {
    static create(file: string, content: string | object, options?: fs.WriteFileOptions) {
        DirectoryManager.create(path.dirname(file))
        fs.writeFileSync(
            file,
            typeof content == 'string' ? content : JSON.stringify(content, null, 2),
            options || 'utf8'
        );
        return this;
    }

    static read(file: string, options?: BufferEncoding | {
        encoding?: BufferEncoding | null | undefined,
        flag?: string | undefined
    } | null,) {
        return fs.readFileSync(file, options);
    }

    static safeRead(
        file: string,
        options?: BufferEncoding | { encoding?: BufferEncoding | null | undefined, flag?: string | undefined } | null,
        fallbackContent?: string
    ) {
        if (!fs.existsSync(file)) {
            this.create(file, fallbackContent || '', {encoding: 'utf-8'});
        }
        return this.read(file, options);
    }

    static remove(file: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                fs.unlinkSync(file);
                resolve();
            } catch (e) {
                reject(e);
            }
        })
    }
}