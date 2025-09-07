import * as fs from "node:fs";
export declare class DirectoryManager {
    static create(directory: string): typeof DirectoryManager;
    static remove(directory: string): Promise<void>;
    static prune(directory: string): Promise<void>;
    static scan(directory: string, options?: {
        encoding: BufferEncoding | null;
        withFileTypes?: false | undefined;
        recursive?: boolean | undefined;
    } | BufferEncoding | null, callback?: (file: string) => void): string[];
}
export declare class FileManager {
    static create(file: string, content: string | object, options?: fs.WriteFileOptions): typeof FileManager;
    static read(file: string, options?: BufferEncoding | {
        encoding?: BufferEncoding | null | undefined;
        flag?: string | undefined;
    } | null): string | NonSharedBuffer;
    static safeRead(file: string, options?: BufferEncoding | {
        encoding?: BufferEncoding | null | undefined;
        flag?: string | undefined;
    } | null, fallbackContent?: string): string | NonSharedBuffer;
    static remove(file: string): Promise<void>;
}
