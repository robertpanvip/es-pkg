import chalk from 'chalk';// 改变屏幕文字颜色
import type {Options as ExecaOptions, ExecaReturnValue} from 'execa'
import del from 'del';
import type {ProgressData} from 'del';
import path from "path";
import fs from "fs";

const appDirectory = fs.realpathSync(process.cwd());

export const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

export const pkg = JSON.parse(fs.readFileSync(resolveApp('package.json'), 'utf-8'))

export const getJson=(relativePath: string) =>{
    try {
        return JSON.parse(fs.readFileSync(resolveApp(relativePath), 'utf-8'))
    }catch(err){
        return {}
    }
}
const esPkgInfo = getJson('espkg.json')

export const config = {
    lib: "./lib",
    es: "./es",
    dist: "./dist",
    src: "./src",
    typings: "./typings",
    entry: `./src/index.tsx`,
    publishDir: `../${pkg.name}-npm`,
    ...esPkgInfo,
}

export const titleCase = (str: string) => {
    const strArr = str.split(/[_\-]/)
    return strArr.map(item => {
        let tmp = item.toLowerCase()
        tmp = tmp.charAt(0).toUpperCase() + tmp.slice(1)
        return tmp
    }).join("")
}

/**
 *删除文件或者文件夹
 **/
export async function remove(url: string, folders: boolean = false) {
    const path = folders ? `${url}/**/*` : url;
    await del([path], {
        force: true,
        dot: true,
        gitignore: false,
        onProgress({totalCount, deletedCount, percent}: ProgressData) {
        }
    });
}

export function step(msg: string): void {
    return console.log(chalk.cyan(msg))
}

export async function run(
    bin: string,
    args: string[],
    opts: ExecaOptions<string> = {}
): Promise<ExecaReturnValue<string>> {
    //由于execa 的包是esm形式的
    const {execa} = await import("execa")
    return execa(bin, args, {stdio: 'inherit', ...opts})
}

export const autoUpgrade = (str: string) => {
    let arr = str.split('.').map(it => Number(it));
    const autoUpgradeVersion = (arr: number[], index: number) => {
        if (index === 0) {
            arr[0] = arr[0] + 1;
        } else {
            let value = arr[index] + 1;
            if (value < 30) {
                arr[index] = value;
            } else {
                arr[index] = 0;
                autoUpgradeVersion(arr, index - 1);
            }
        }
    }
    autoUpgradeVersion(arr, arr.length - 1);
    return arr.map(it => Number(it)).join('.');
}
