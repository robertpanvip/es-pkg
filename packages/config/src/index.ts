import fs from "node:fs";
import path from "node:path";
import {defineConfig, EsPkgConfig} from "./defineConfig";
import {isDirectory} from "@es-pkg/utils";

const appDirectory = fs.realpathSync(process.cwd())
export const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);
export const relativeToApp = (relativePath: string) => {
    const app = resolveApp('');
    const p = resolveApp(relativePath);
    return path.relative(app, p)
};
export const pkg = JSON.parse(fs.readFileSync(resolveApp('package.json'), 'utf-8'))

export const getJson = (relativePath: string) => {
    try {
        return JSON.parse(fs.readFileSync(resolveApp(relativePath), 'utf-8'))
    } catch (err) {
        return {}
    }
}

function isFileExists(filePath: string) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
}

const esPkgInfo = getJson('espkg.json')
export const config: Required<EsPkgConfig> & { include: string[] } = {
    cjs: "./npm/cjs",
    es: "./npm/esm",
    iife: "./npm/iife",
    typings: "./typings",
    entry: `./src`,
    entryCss: [],
    publishDir: `./npm`,
    doc: 'README',
    removeCompiled: true,
    ...esPkgInfo,
}
export const resolveConfig = async () => {
    const configPath = resolveApp('espkg.config.ts');
    const pkgConfigPath = resolveApp('pkg.config.ts')
    const tsconfigPath = resolveApp('tsconfig.json')

    if (isFileExists(pkgConfigPath)) {
        const res = require(pkgConfigPath)
        Object.assign(config, res.default)
    }
    if (isFileExists(configPath)) {
        const res = require(configPath)
        Object.assign(config, res.default)
    }
    if (isFileExists(tsconfigPath)) {
        const res = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
        Object.assign(config, {
            include: Array.isArray(res.include) ? res.include : [res.include]
        })
    }
}
const suffixes = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];

export function getDirectoryIndexPath(dir: string) {
    const item = suffixes.find(suffix => {
        return !!fs.existsSync(path.posix.join(dir, `index${suffix}`));
    })
    if (!item) {
        throw new Error('not fount entry')
    }
    return item
}

export function getIndexFilePath(_path: string) {
    const {dir, name} = path.parse(_path)
    const item = suffixes.find(suffix => {
        return !!fs.existsSync(path.join(dir, `${name}${suffix}`));
    })
    const getRelativeToNpm = (val: string) => path.relative(config.publishDir, val)
    if (item) {
        const valid = path.posix.join(dir, `${name}${item}`)
        if (isDirectory(valid)) {
            return getRelativeToNpm(getDirectoryIndexPath(valid))
        } else {
            return getRelativeToNpm(valid)
        }
    } else {
        console.error('not fount entry:' + _path);
        return ""
    }
}


export function getEntrypoint(_dir: string, entry = config.entry) {
    const include = getTsconfigIncludeFiles()
    const appPath = resolveApp("");
    // 获取相对路径
    const entryPath = path.relative(appPath, resolveApp(entry));
    const filePath = getIndexFilePath(path.join(config.publishDir, entryPath))
    if (filePath) {
        return filePath.split(path.sep).join('/')
    }
    let _path;
    if (include.length > 1) {
        _path = entryPath
    } else {
        const arr = entryPath.split(path.sep);
        arr.shift();
        _path = arr.join(path.sep);
    }
    const res = getIndexFilePath(path.join(_dir, _path))
    return res.split(path.sep).join('/')
}

export function getTsconfigIncludeFiles(): { isDirectory: boolean, path: string }[] {
    const appPath = resolveApp('')
    const tsconfigPath = resolveApp('tsconfig.json')
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    const include: string[] = Array.isArray(tsconfig.include) ? tsconfig.include : [tsconfig.include]
    return include.flatMap((pattern: string) => {
        const _ = path.join(appPath, pattern)
        return [{
            isDirectory: isDirectory(_),
            path: _
        }]
    });
}

export * from './defineConfig'

export default defineConfig