import fs from 'fs';
import type {ProgressData} from 'del';
import {deleteAsync} from 'del';

export function isDirectory(path:string) {
    try {
        const stats = fs.statSync(path);
        return stats.isDirectory();
    } catch (err) {
        return false;
    }
}

/**
 *删除文件或者文件夹
 **/
export async function remove(url: string, folders: boolean = false) {
    const path = folders ? `${url}/**/*` : url;
    await deleteAsync([path], {
        force: true,
        dot: true,
        gitignore: false,
        onProgress({totalCount, deletedCount, percent}: ProgressData) {
        }
    });
}