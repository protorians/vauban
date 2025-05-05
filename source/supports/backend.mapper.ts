import fs from "node:fs";
import path from "node:path";


export class BackendMapper {

    static scan(directory: string, callback?: (file: string) => void): string[] {
        if (!fs.existsSync(directory)) return [];
        if (!fs.statSync(directory).isDirectory()) return [];

        let dir: string[] = [];
        for (const file of fs.readdirSync(directory, {recursive: true, encoding: 'utf-8'})) {
            const filepath = path.join(directory, file);
            if (fs.statSync(filepath).isDirectory()) {
                dir.push(file);
                dir = [...dir, ...this.scan(filepath, callback)]
            } else {
                if (callback) callback(filepath);
            }
        }
        return dir;
    }

}