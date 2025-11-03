import fs from "node:fs";
import path from "node:path";
import {defineConfig, EsPkgConfig} from "./defineConfig";
import {getValidPkgName, isDirectory} from "@es-pkg/utils";

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
        try {
            const content = fs.readFileSync(relativePath, 'utf-8')
            const _content = content.replace(/\/\/.*?$|\/\*[\s\S]*?\*\//gm, '')
            return JSON.parse(_content)
        } catch (e) {
            return {}
        }
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

export const config: Required<EsPkgConfig> = {
    cjs: "./npm/cjs",
    es: "./npm/esm",
    typings: "./typings",
    entry: `./src`,
    include: ['./src'],
    publishDir: `./npm`,
    doc: 'README',
    removeCompiled: true,
    publishRegistry: "https://registry.npmjs.org",
    ...esPkgInfo,
}
export const resolveConfig = async () => {
    const configPath = resolveApp('espkg.config.ts');
    const pkgConfigPath = resolveApp('pkg.config.ts');
    if (isFileExists(pkgConfigPath)) {
        const res = require(pkgConfigPath)
        Object.assign(config, res.default)
    }
    if (isFileExists(configPath)) {
        const res = require(configPath)
        Object.assign(config, res.default)
    }
    if (!config.css) {
        config.css = {}
    }
    if (!config.css.browserslist) {
        config.css.browserslist = ['last 2 versions']
    }
    if(!('extract' in config.css)){
        const name = getValidPkgName(pkg.name);
        config.css.extract = `${name}.min.css`
    }
    if(!('extra' in config.css)){
        config.css.extra = []
    }
}
const suffixes = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];

export function getDirectoryIndexPath(dir: string) {
    const item = suffixes.find(suffix => {
        return !!fs.existsSync(path.join(dir, `index${suffix}`));
    })
    if (!item) {
        throw new Error('not fount entry')
    }
    return item
}

export function getIndexFilePath(_path: string) {
    const getRelativeToNpm = (val: string) => path.relative(config.publishDir, val);

    const fileOrDir = path.basename(_path);

    const {dir, name} = !fileOrDir.includes('.') ? {dir: _path, name: 'index'} : path.parse(_path);

    const item = suffixes.find(suffix => {
        return !!fs.existsSync(path.join(dir, `${name}${suffix}`));
    })

    if (item) {
        const valid = path.join(dir, `${name}${item}`)
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

export function getIncludeFiles(): { isDirectory: boolean, path: string }[] {
    const appPath = resolveApp('')
    const include: string[] = Array.isArray(config.include) ? config.include : [config.include]
    return include.flatMap((pattern: string) => {
        const _ = path.join(appPath, pattern)
        return [{
            isDirectory: isDirectory(_),
            path: _,
        }]
    });
}

const include = getIncludeFiles()

function getShallowInputs() {
    const extNames = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',];
    return include.flatMap(item => {
        if (item.isDirectory) {
            // 获取该目录下一级文件
            const files = fs.readdirSync(item.path, {withFileTypes: true});
            return files
                .filter(f => f.isFile() && extNames.includes(path.extname(f.name)))
                .map(f => path.join(item.path, f.name));
        } else if (extNames.includes(path.extname(item.path))) {
            return [item.path];
        } else {
            return [];
        }
    })
}

export const shallowInputs = getShallowInputs();

function collectSourceFiles() {
    const extNames = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

    function walk(dirPath: string): string[] {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        return entries.flatMap(entry => {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                return walk(fullPath);
            }
            return extNames.includes(path.extname(entry.name)) ? [fullPath] : [];
        });
    }

    return include.flatMap(item => {
        if (item.isDirectory) {
            return walk(item.path);
        } else if (extNames.includes(path.extname(item.path))) {
            return [item.path];
        } else {
            return [];
        }
    });
}

export const collectInputs = collectSourceFiles();

export const getNpmEntry = (entry: string, _basePath: string) => {
    const npm = config.publishDir;
    const basename = path.basename(_basePath);
    const basePath = path.join(npm, basename)

    const include = getIncludeFiles();
    let res = entry;
    include.find(item => {
        if (path.resolve(entry).startsWith(path.resolve(item.path))) {
            const pp = item.isDirectory && include.length > 1 ?
                path.join(basePath, relativeToApp(item.path))
                : relativeToApp(basePath);
            const v1 = path.resolve(item.path, item.isDirectory ? '' : '../');
            const v2 = path.resolve(pp);
            const v3 = path.resolve(entry);
            res = relativeToApp(v3.replace(v1, v2))
        }
    })
    return relativeToApp(res)
}


export function getEntrypoint(basePath: string, entry = config.entry) {
    const _entry = getNpmEntry(entry, basePath)
    const res = getIndexFilePath(path.resolve(_entry))
    return res.split(path.sep).join('/')
}


export * from './defineConfig'

export default defineConfig