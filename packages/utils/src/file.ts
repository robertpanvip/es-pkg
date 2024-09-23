import fs from 'fs';
export function isDirectory(path:string) {
    try {
        const stats = fs.statSync(path);
        return stats.isDirectory();
    } catch (err) {
        return false;
    }
}