import fs from "node:fs";
import path from "node:path";
export class BackendMapper {
    static async scan(directory, callback) {
        if (!fs.existsSync(directory))
            return [];
        if (!fs.statSync(directory).isDirectory())
            return [];
        let dir = [];
        for (const file of fs.readdirSync(directory, { recursive: true, encoding: 'utf-8' })) {
            const filepath = path.join(directory, file);
            if (fs.statSync(filepath).isDirectory()) {
                dir.push(file);
                dir = [...dir, ...(await this.scan(filepath, callback))];
            }
            else {
                if (callback) {
                    await callback(filepath);
                }
            }
        }
        return dir;
    }
}
