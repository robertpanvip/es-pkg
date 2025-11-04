import fs from "node:fs";
import path from "node:path";
import {defineConfig, EsPkgConfig} from "./defineConfig";
import {getValidPkgName, isDirectory, log} from "@es-pkg/utils";

/** 支持的源文件后缀 */
const SOURCE_SUFFIXES = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

const cwd = process.cwd();

const appDirectory = fs.realpathSync(cwd);

/** 解析相对路径为绝对路径 */
export const resolveApp = (relativePath: string) =>
    path.resolve(appDirectory, relativePath);

/** 将路径转为相对于项目根目录的相对路径 */
export const relativeToApp = (relativePath: string) => {
    const app = resolveApp("");
    const p = resolveApp(relativePath);
    return path.relative(app, p);
};

/** 读取并解析 package.json */
export const pkg = JSON.parse(
    fs.readFileSync(resolveApp("package.json"), "utf-8")
);

/** 尝试解析 JSON 文件（支持去掉注释） */
export const getJson = (relativePath: string) => {
    const absPath = resolveApp(relativePath);
    if (!fs.existsSync(absPath)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(resolveApp(relativePath), "utf-8"));
    } catch {
        try {
            const content = fs.readFileSync(relativePath, "utf-8");
            const sanitized = content.replace(/\/\/.*?$|\/\*[\s\S]*?\*\//gm, "");
            return JSON.parse(sanitized);
        } catch {
            return {};
        }
    }
};


/** 尝试读取多个可能存在的配置文件 */
const userConfig = (() => {
    const candidates = ["espkg.json", "es-pkg.json"];
    for (const name of candidates) {
        const data = getJson(name);
        if (Object.keys(data).length > 0) return data; // 找到第一个有效配置
    }
    return {};
})();

/** 默认配置，合并用户配置 */
export const config: Required<EsPkgConfig> = {
    cjs: "./npm/cjs",
    es: "./npm/esm",
    typings: "./typings",
    include: ["./src"],
    publishDir: "./npm",
    doc: "README",
    removeCompiled: true,
    publishRegistry: "https://registry.npmjs.org",
    ...userConfig,
};


/** 解析并应用 es-pkg.config.ts或 pkg.config.ts */
export const resolveConfig = async () => {
    if (typeof config.doc === 'string') {
        config.doc = {
            name: pkg.name,
            desc: pkg.desc,
            outName: config.doc,
            tsconfig: path.join(cwd, './tsconfig.json'),
        }
    }

    const applyConfig = (file: string) => {
        /** 检查文件是否存在 */
        if (!fs.existsSync(file)) return;
        const mod = require(file);
        Object.assign(config, mod.default);
    };

    applyConfig(resolveApp("pkg.config.ts"));
    applyConfig(resolveApp("espkg.config.ts"));
    applyConfig(resolveApp("es-pkg.config.ts"));
    if (!config.entry) {
        const json = getJson("package.json")
        config.entry = json.main || json.module || json.browser
        config.entry && log.info(`解析${resolveApp("package.json")}-入口文件`)
    }
    if (!config.entry) {
        config.entry = `./src/`;
    }
    if (config.entry) {
        if (isDirectory(resolveApp(config.entry))) {
            config.entry = `${config.entry}index`
        }
        if (path.extname(config.entry) === '') {
            const suffix = SOURCE_SUFFIXES.map(ext => `${config.entry}${ext}`)
                .find(f => fs.existsSync(f));
            if (!suffix) {
                throw new Error('请指定入口文件')
            } else {
                config.entry = `${config.entry}${suffix}`
            }
        }
    }
    if (!config.entry) {
        throw new Error('请指定入口文件')
    }

    config.css ??= {};
    config.css.browserslist ??= getJson("package.json").browserslist || ["last 2 versions"];
    config.css.extract ??= `${getValidPkgName(pkg.name)}.min.css`;
    config.css.extra ??= [];
};

/** 获取 include 配置下的路径列表 */
export function getIncludeFiles(): { isDirectory: boolean; path: string }[] {
    const appPath = resolveApp("");
    const include = Array.isArray(config.include)
        ? config.include
        : [config.include];
    return include.map(pattern => {
        const abs = path.join(appPath, pattern);
        return {isDirectory: isDirectory(abs), path: abs};
    });
}

const include = getIncludeFiles();


/** 获取 include 目录下的一级源文件 */
function getShallowInputs() {
    const EXT = SOURCE_SUFFIXES;
    return include.flatMap(item => {
        if (!item.isDirectory) {
            return EXT.includes(path.extname(item.path)) ? [item.path] : [];
        }
        return fs
            .readdirSync(item.path, {withFileTypes: true})
            .filter(f => f.isFile() && EXT.includes(path.extname(f.name)))
            .map(f => path.join(item.path, f.name));
    });
}

export const shallowInputs = getShallowInputs();

/** 递归收集所有源文件路径 */
function collectSourceFiles() {
    const EXT = SOURCE_SUFFIXES;
    const walk = (dirPath: string): string[] =>
        fs.readdirSync(dirPath, {withFileTypes: true}).flatMap(entry => {
            const fullPath = path.join(dirPath, entry.name);
            return entry.isDirectory()
                ? walk(fullPath)
                : EXT.includes(path.extname(entry.name))
                    ? [fullPath]
                    : [];
        });

    return include.flatMap(item =>
        item.isDirectory
            ? walk(item.path)
            : EXT.includes(path.extname(item.path))
                ? [item.path]
                : []
    );
}

export const collectInputs = collectSourceFiles();

/** 获取入口文件路径（相对 npm 目录） */
export function getPublishedEntry(basePath: string, entry = config.entry): string {
    const srcEntry = resolveApp(entry);
    const publishDir = resolveApp(config.publishDir);

    // 计算相对路径
    const relativePath = path.relative(resolveApp(''), srcEntry);
    const entryDir = path.relative(publishDir, basePath);
    const releaseDir = path.join(publishDir, entryDir);

    // 替换 src 为相对路径，并处理 ts/tsx 到 js 的转换
    const replacedPath = relativePath.replace(/^src/, '').replace(/\.(ts|tsx)$/, '.js');

    // 目标路径
    const releaseRelativePath = path.join(releaseDir, relativePath.replace(/\.(ts|tsx)$/, '.js'));
    const releaseReplacedPath = path.join(releaseDir, replacedPath);

    // 检查文件是否存在，并返回相对路径
    const fileToCheck = fs.existsSync(releaseReplacedPath) ? releaseReplacedPath : releaseRelativePath;
    if (fs.existsSync(fileToCheck)) {
        return path.relative(publishDir, fileToCheck).replaceAll(path.sep, '/');
    }

    return '';  // 如果没有找到文件，返回空字符串
}

export * from "./defineConfig";
export default defineConfig;
