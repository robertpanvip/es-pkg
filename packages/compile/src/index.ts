import gulp, {series} from "@es-pkg/gulp";
import * as utils from "@es-pkg/utils";
import * as esConfig from "@es-pkg/config";
import {OutputOptions, rollup, RollupOptions} from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import path from "node:path";
import fs from "node:fs";
import esbuild from "rollup-plugin-esbuild";
import {builtinModules} from "node:module";
import ts from 'typescript'

const {remove, log, getValidPkgName, toPascalCase} = utils;
const {config, collectInputs, shallowInputs, pkg, relativeToApp, resolveApp} = esConfig;
const name = getValidPkgName(pkg.name);

/* ------------------ 清理输出目录 ------------------ */
const clean = () => {
    log(`清除 ${relativeToApp(config.es)} & ${relativeToApp(config.cjs)} 目录---开始`);
    const promises = [
        remove(config.publishDir, true),
        remove(config.es, true),
        remove(config.cjs, true),
        remove(config.iife, true),
    ];
    return Promise.all(promises).then(() => {
        log(`清除 ${relativeToApp(config.es)} & ${relativeToApp(config.cjs)} 目录---结束`);
    });
};

/* ------------------ PostCSS 配置 ------------------ */
function getPostcss(extract?: string | boolean) {
    return postcss({
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
function getInputOptions(format: string): RollupOptions {
    return {
        input: shallowInputs.filter((item) => !item.endsWith(".d.ts")),
        external: (id) => {
            // 内置模块和 node_modules 可以外部
            if (builtinModules.includes(id)) return true;
            if (!id.startsWith('.') && !path.isAbsolute(id) && isNodeModule(id)) return true;
            // 保证 src 内部依赖都是内部模块
            return false;
        },
        plugins: [
            json(),
            resolve(),
            commonjs({
                defaultIsModuleExports: true,
                esmExternals: true,
                transformMixedEsModules: true, // 混合模块也转换
            }),
            esbuild({target: "es2018", format: "esm"}),
            getPostcss(config.css.extract),
        ],
    };
}

/** 生成声明文件 */
async function buildDeclarations() {
    const tsConfig = ts.readConfigFile(resolveApp('tsconfig.json'), ts.sys.readFile);
    if (tsConfig.error) {
        console.log(tsConfig.error.messageText);
    }
    const parsedConfig = ts.parseJsonConfigFileContent(
          tsConfig.config,
          ts.sys,
          resolveApp("./")
      );
    const entryFiles = collectInputs.filter((item) => ['.ts', '.tsx'].some(suf => item.endsWith(suf)));

    const compilerOptions: ts.CompilerOptions = {
        ...parsedConfig.options,
        declaration: true,
        emitDeclarationOnly: true,
        outDir: config.es,
        rootDir: resolveApp("src"),
        skipLibCheck: true,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
    };

    const host = ts.createCompilerHost(compilerOptions);

    host.writeFile = (fileName, contents) => {
        const dir = path.dirname(fileName);
        fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(fileName, contents, 'utf8');
    };

    const program = ts.createProgram(entryFiles, compilerOptions, host);
    const emitResult = program.emit();

    const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    if (diagnostics.length > 0) {
        console.error(
            ts.formatDiagnosticsWithColorAndContext(diagnostics, {
                getCanonicalFileName: f => f,
                getCurrentDirectory: ts.sys.getCurrentDirectory,
                getNewLine: () => ts.sys.newLine,
            }),
        );
    } else {
        console.log(`✅ Declarations generated in: ${path.resolve(config.es)}`);
    }
    log.success("✅ Declarations build complete!");
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

            [config.cjs, config.iife].forEach((targetRoot) => {
                const dest = path.join(resolveApp(targetRoot), dirname, `${filename}.min.css`);
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

/* ------------------ JS 构建（ES / CJS / IIFE） ------------------ */
async function buildJS() {
    const outputOptions: OutputOptions[] = [
        {
            dir: config.es,
            format: "es",
            preserveModules: true,
            preserveModulesRoot: resolveApp("src"),
        },
        {
            dir: config.cjs,
            format: "cjs",
            preserveModules: true,
            preserveModulesRoot: resolveApp("src"),
            exports: "named",
            interop: "auto"
        },
        ...(config.iife
            ? [
                {
                    dir: config.iife,
                    format: "iife",
                    exports: "named",
                    name: toPascalCase(name),
                } as OutputOptions,
            ]
            : []),
    ];

    for (const output of outputOptions) {
        const bundle = await rollup(getInputOptions(output.format!));
        await bundle.write(output);
    }

    await buildExtraCss();
    log.success("✅ JS Build complete!");
}

/* ------------------ 拷贝声明文件 ------------------ */
const copySrcTds = () => gulp.src(config.include.map((t) => `${t}/**/*.d.ts`)).pipe(gulp.dest(config.es));
const copyTds = () => gulp.src([`${config.es}/**/*.d.ts`]).pipe(gulp.dest(config.cjs));

/* ------------------ 主任务导出 ------------------ */
export default series(clean, buildJS, buildDeclarations, copySrcTds, copyTds);
