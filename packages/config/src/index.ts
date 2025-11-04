import fs from "node:fs";
import path from "node:path";
import {defineConfig, EsPkgConfig} from "./defineConfig";
import {getValidPkgName, isDirectory} from "@es-pkg/utils";

const appDirectory = fs.realpathSync(process.cwd());

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
    entry: "./src",
    include: ["./src"],
    publishDir: "./npm",
    doc: "README",
    removeCompiled: true,
    publishRegistry: "https://registry.npmjs.org",
    ...userConfig,
};


/** 解析并应用 espkg.config.ts或 es-pkg.config.ts 或 pkg.config.ts */
export const resolveConfig = async () => {
    const applyConfig = (file: string) => {
        /** 检查文件是否存在 */
        if (!fs.existsSync(file)) return;
        const mod = require(file);
        Object.assign(config, mod.default);
    };

    applyConfig(resolveApp("pkg.config.ts"));
    applyConfig(resolveApp("espkg.config.ts"));
    applyConfig(resolveApp("es-pkg.config.ts"));

    config.css ??= {};
    config.css.browserslist ??= ["last 2 versions"];
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
/** 支持的源文件后缀 */
const SOURCE_SUFFIXES = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

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
export function getPublishedEntry(basePath: string, entry = config.entry) {
    const publishDir = path.resolve(basePath);
    const srcEntry = path.resolve(entry);

    let finalPath = "";

    const isDir = fs.existsSync(srcEntry) && fs.statSync(srcEntry).isDirectory();
    if (isDir) {
        // 如果是目录，查找 index 文件
        const indexFile = SOURCE_SUFFIXES.map(ext => path.join(srcEntry, `index${ext}`))
            .find(f => fs.existsSync(f));
        if (!indexFile) {
            return ''
        }
        finalPath = indexFile;
    } else {
        // 如果是文件，直接使用
        if (!fs.existsSync(srcEntry)) {
            //throw new Error(`Entry file not found: ${srcEntry}`);
            return ''
        }
        finalPath = srcEntry;
    }

    // 计算相对于发布目录的路径
    const relativePath = path.relative(config.publishDir, path.join(publishDir, path.relative(config.entry, finalPath)));
    return relativePath.split(path.sep).join('/');
}

export function resolvePublishedPath(main: string, type: "es" | "cjs" = 'es'): string {
    // 获取 main 的绝对路径
    const mainSrc = path.resolve(resolveApp(''), main);

    // 如果 main 文件存在
    if (fs.existsSync(mainSrc)) {
        // 计算相对路径
        const relativePath = path.relative(config.entry, mainSrc);

        // 获取目标目录
        const targetDir = resolveApp(config[type]);

        // 拼接目标文件路径
        const targetFile = path.join(targetDir, relativePath);
        // 检查文件是否存在，并返回相对路径
        if (fs.existsSync(targetFile)) {
            // 计算相对路径并返回路径格式化为 '/' 分隔符
            return path.relative(config.publishDir, targetFile).replaceAll(path.sep, '/');
        }
        // 如果文件是 ts 或 tsx，改为 js
        const ext = path.extname(targetFile);
        const compiledMain = (ext === '.ts' || ext === '.tsx') && !targetFile.endsWith('.d.ts')
            ? targetFile.slice(0, -ext.length) + '.js'
            : targetFile;

        // 检查文件是否存在，并返回相对路径
        if (fs.existsSync(compiledMain)) {
            // 计算相对路径并返回路径格式化为 '/' 分隔符
            return path.relative(config.publishDir, compiledMain).replaceAll(path.sep, '/');
        }
    }

    return ''; // 如果文件不存在，返回空字符串
}

export * from "./defineConfig";
export default defineConfig;
