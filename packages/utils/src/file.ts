import fs from 'fs';
export function isDirectory(path:string) {
    try {
        const stats = fs.statSync(path);
        return stats.isDirectory();
    } catch (err) {
        console.error('无法访问路径:', err);
        return false;
    }
}