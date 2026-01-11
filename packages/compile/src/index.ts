import {series} from "@es-pkg/gulp";
import * as utils from "@es-pkg/utils";
import * as esConfig from "@es-pkg/config";
import {OutputOptions, rollup, RollupOptions} from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dts from 'rollup-plugin-dts';
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import path from "node:path";
import fs from "node:fs";
import esbuild from "rollup-plugin-esbuild";
import {builtinModules} from "node:module";
import ts from 'typescript'

const {remove, log, getValidPkgName, toPascalCase} = utils;
const {config, getShallowInputs, pkg, relativeToApp, resolveApp} = esConfig;
const name = getValidPkgName(pkg.name);

/* ------------------ 清理输出目录 ------------------ */
const clean = async () => {
    log(`${config.es && `清除 ${relativeToApp(config.es)}`} ${config.cjs && `& ${relativeToApp(config.cjs)}`} 目录---开始`);
    const promises = [
        remove(config.publishDir, true),
        config.es && remove(config.es, true),
        config.cjs && remove(config.cjs, true),
        remove(config.iife, true),
    ].filter(Boolean);
    await Promise.all(promises);
    log(`${config.es && `清除 ${relativeToApp(config.es)}`} ${config.cjs && `& ${relativeToApp(config.cjs)}`} 目录---结束`);
};

/* ------------------ PostCSS 配置 ------------------ */
function getPostcss(extract?: string | boolean) {
    return postcss({
        modules: {
            localsConvention: 'camelCase', // ✅ 横线转驼峰命名
        },
        extensions: [".less", ".scss", ".sass"],
        use: {
            stylus: ["sass"],
            less: ["less"],
            sass: ["sass"],
        },
        plugins: [autoprefixer({overrideBrowserslist: config.css.browserslist}), cssnano()],
        extract,
    });
}

/* ------------------ 判断是否 Node 模块 ------------------ */
function isNodeModule(id: string) {
    try {
        const resolved = require.resolve(id, {paths: [process.cwd()]});
        return resolved.includes("node_modules");
    } catch {
        return false;
    }
}

/* ------------------ Rollup 输入配置 ------------------ */
function getInputOptions(emit: boolean): RollupOptions {
    const defaultPlugins = [
        json(),
        resolve(),
        commonjs({
            defaultIsModuleExports: true,
            esmExternals: true,
            transformMixedEsModules: true, // 混合模块也转换
        }),
        emit ? dts({compilerOptions: getCompilerOptions()}) : esbuild({target: "es2018", format: "esm"}),
        getPostcss(config.css.extract),
    ]
    const plugins = config.rollupOptions?.plugins ? config.rollupOptions?.plugins?.(defaultPlugins) : defaultPlugins
    return {
        input: getShallowInputs().filter((item) => !item.endsWith(".d.ts")),
        external: (id) => {
            const defaultExternal = (id: string) => {
                // 内置模块和 node_modules 可以外部
                if (builtinModules.includes(id)) return true;
                return !!(!id.startsWith('.') && !path.isAbsolute(id) && isNodeModule(id));
            }
            if (config.rollupOptions?.external) {
                return config.rollupOptions.external(id, defaultExternal);
            } else {
                return defaultExternal(id)
            }
        },
        plugins,
    };
}

/** 生成声明文件 */
function getCompilerOptions() {
    const tsConfig = ts.readConfigFile(resolveApp('tsconfig.json'), ts.sys.readFile);
    if (tsConfig.error) {
        console.log(tsConfig.error.messageText);
    }
    const parsedConfig = ts.parseJsonConfigFileContent(
        tsConfig.config,
        ts.sys,
        resolveApp("./")
    );
    const compilerOptions: ts.CompilerOptions = {
        ...parsedConfig.options,
        declaration: true,
        noEmit: false,
        emitDeclarationOnly: true,
        outDir: config.es as string,
        rootDir: resolveApp("src"),
        skipLibCheck: true,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
    };
    return compilerOptions
}

/* ------------------ 额外 CSS 构建 ------------------ */
async function buildExtraCss() {
    const extras = config.css.extra;
    if (!extras?.length) return;

    const srcRoot = resolveApp("src");
    const esRoot = resolveApp(config.es);

    const tasks = extras.map(async (v) => {
        try {
            const absPath = resolveApp(v);
            const relativePath = path.relative(srcRoot, absPath);
            const dirname = path.dirname(relativePath);
            const filename = path.basename(v, path.extname(v));

            const bundle = await rollup({
                input: [v],
                plugins: getPostcss(path.join(dirname, `${filename}.min.css`)),
            });

            await bundle.write({
                dir: config.es,
                format: "es",
                sourcemap: false,
                preserveModules: true,
                preserveModulesRoot: srcRoot,
            });

            const jsFile = path.join(esRoot, dirname, `${filename}${path.extname(v)}.js`);
            if (fs.existsSync(jsFile)) fs.unlinkSync(jsFile);

            [config.cjs, config.iife].filter(Boolean).forEach((targetRoot) => {
                const dest = path.join(resolveApp(targetRoot as string), dirname, `${filename}.min.css`);
                fs.mkdirSync(path.dirname(dest), {recursive: true});
                fs.copyFileSync(path.join(esRoot, dirname, `${filename}.min.css`), dest);
            });

            log.success(`✅ 编译完成: ${v}`);
        } catch (err) {
            log.error(`❌ 编译失败: ${v}`, err);
        }
    });

    await Promise.all(tasks);
    log.success("✅ 所有额外 CSS 编译完成");
}

async function buildDts() {
    return build(true)
}

async function buildJS() {
    return build(false)
}

/* ------------------ JS 构建（ES / CJS / IIFE） ------------------ */
async function build(emit: boolean) {
    const outputOptions: OutputOptions[] = [
        {
            dir: config.es,
            format: "es",
            preserveModules: true,
            preserveModulesRoot: resolveApp("src"),
        },
        config.cjs && {
            dir: config.cjs,
            format: "cjs",
            preserveModules: true,
            preserveModulesRoot: resolveApp("src"),
            exports: "named",
            interop: "auto"
        },
        config.iife && {
            dir: config.iife,
            format: "iife",
            exports: "named",
            name: toPascalCase(name),
        },
    ].filter(Boolean) as OutputOptions[];

    for (const output of outputOptions) {
        const bundle = await rollup(getInputOptions(emit));
        await bundle.write(output);
    }

    !emit && await buildExtraCss();
    log.success(`✅ ${emit ? 'DTS ' : "JS "}Build complete!`);
}

/* ------------------ 主任务导出 ------------------ */
export default series(clean, buildJS, buildDts);
