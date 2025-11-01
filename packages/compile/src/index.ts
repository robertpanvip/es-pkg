import gulp, {series} from "@es-pkg/gulp";
import {remove, log, getValidPkgName, toPascalCase} from "@es-pkg/utils";
import {config, shallowInputs, pkg, relativeToApp, resolveApp} from "@es-pkg/config";
import {OutputOptions, rollup, RollupOptions} from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import path from 'node:path';
import fs from 'node:fs'
import { builtinModules } from 'node:module';

const clean = () => {
    log(`清除 ${relativeToApp(config.es)} & ${relativeToApp(config.cjs)} 目录---开始`);
    const promises = [
        remove(config.publishDir, true),
        remove(config.es, true),
        remove(config.cjs, true),
        remove(config.iife, true),
    ]
    return Promise.all(promises).then(res => {
        log(`清除 ${relativeToApp(config.es)} & ${relativeToApp(config.cjs)} 目录---结束`)
    })
}

function getPostcss(extract?: string | boolean) {
    return postcss({
        // 处理 Less（需安装 less）
        extensions: ['.less', '.scss', '.sass'], // 识别 less 扩展名
        // 为不同类型的文件指定对应的编译器（关键修改）
        use: {
            "stylus": ['sass'],
            'less': ['less'], //.less 文件用 less 编译
            'sass': ['sass']  //.sass 文件用 sass 编译（缩进语法）
        },

        // 配置 PostCSS 插件（自动前缀、压缩）
        plugins: [
            autoprefixer({overrideBrowserslist: config.css.browserslist}),
            cssnano() // 生产环境压缩 CSS
        ],

        // 输出配置：提取为单独的 CSS 文件（推荐）
        extract, // 提取到 ${name}.min.css

        // 可选：不提取，嵌入到 JS 中（通过 import 会生成 style 标签）
        // extract: false
    })
}

const name = getValidPkgName(pkg.name);

// 1. 配置输入选项
function getInputOptions(isIIFE?: boolean, declarationDir?: string): RollupOptions {
    function isNodeModule(id: string) {
        // 获取模块绝对路径
        try {
            const resolved = require.resolve(id, {paths: [process.cwd()]});
            return resolved.includes('node_modules');
        } catch {
            // 无法 resolve 的，认为是本地模块
            return false;
        }
    }

    return ({
        input: shallowInputs,
        external: id => {
            // Node 内置模块或者 npm 包都 external
            if (builtinModules.includes(id)) return true;
            if (id.startsWith('node:')) {
                return true
            }
            // 排除本地相对路径和绝对路径，别名映射到本地也不会 external
            if (id.startsWith('.') || path.isAbsolute(id)) return false;
            // node_modules 下的模块才 external
            return isNodeModule(id);
        },
        plugins: [
            json(),
            isIIFE && resolve(),   // 解析 node_modules
            commonjs(),   // 转换 CommonJS 模块
            typescript({
                tsconfig: resolveApp('tsconfig.json'), // 可选，指定 tsconfig
                compilerOptions: {
                    noImplicitAny: true,
                    isolatedModules: false,
                    declaration: !!declarationDir,
                    allowImportingTsExtensions: false,
                    declarationDir,
                    noEmit: false,
                    emitDeclarationOnly: !!declarationDir,
                    esModuleInterop: true,
                    resolveJsonModule: true,
                    skipLibCheck: true,
                    removeComments: false,
                    rootDir: resolveApp('src'), // ✅ 指定源代码根目录
                }
            }),
            getPostcss(config.css.extract)
        ].filter(Boolean)
    })
}

async function buildExtraCss() {
    const extras = config.css.extra;
    if (!extras?.length) return;

    const srcRoot = resolveApp('src');
    const esRoot = resolveApp(config.es);

    const tasks = extras.map(async (v) => {
        try {
            const absPath = resolveApp(v);               // 源文件绝对路径
            const relativePath = path.relative(srcRoot, absPath); // 相对于 src 的路径
            const dirname = path.dirname(relativePath);  // 相对目录
            const filename = path.basename(v, path.extname(v)); // 文件名去掉扩展名

            // rollup 打包
            const bundle = await rollup({
                input: [v],
                plugins: getPostcss(path.join(dirname, `${filename}.min.css`))
            });

            await bundle.write({
                dir: config.es,
                format: 'es',
                sourcemap: false,
                preserveModules: true,
                preserveModulesRoot: srcRoot
            });

            // 删除生成的 JS 文件
            const jsFile = path.join(esRoot, dirname, `${filename}${path.extname(v)}.js`);
            if (fs.existsSync(jsFile)) fs.unlinkSync(jsFile);

            // 复制到其他目标目录
            [config.cjs, config.iife].forEach(targetRoot => {
                const dest = path.join(resolveApp(targetRoot), dirname, `${filename}.min.css`);
                fs.mkdirSync(path.dirname(dest), {recursive: true});
                fs.copyFileSync(
                    path.join(esRoot, dirname, `${filename}.min.css`),
                    dest
                );
            });

            log.success(`✅ 编译完成: ${v}`);
        } catch (err) {
            log.error(`❌ 编译失败: ${v}`, err);
        }
    });

    await Promise.all(tasks);
    log.success('✅ 所有额外 CSS 编译完成');
}

async function build() {

    // 2. 配置输出选项
    let outputOptions: OutputOptions[] = [
        {
            dir: config.es,
            format: 'es',  // 输出 ES Module
            sourcemap: false,
            preserveModules: true,
            preserveModulesRoot: resolveApp('src'), // ✅ 指定源代码根目录
        },
        {
            dir: config.cjs,
            format: 'cjs',  // 输出 COMMONJS
            sourcemap: false,
            preserveModules: true,
            preserveModulesRoot: resolveApp('src'), // ✅ 指定源代码根目录
            exports: "named",
        },
        {
            dir: config.iife,
            format: 'iife',  // 输出 iife
            sourcemap: false,
            exports: "named",
            name: toPascalCase(name)
        }
    ];
    if (!config.iife) {
        outputOptions = outputOptions.filter(op => op.format !== 'iife')
    }

    for (const output of outputOptions) {
        // 3. 调用 rollup 打包
        const bundle = await rollup(getInputOptions(output.format === 'iife'));
        // 4. 写入文件
        await bundle.write(output);
    }
    {
        const bundle = await rollup(getInputOptions(false, config.es));
        await bundle.write(outputOptions[0]);
    }
    await buildExtraCss();
    log.success('✅ Build complete!');
}

const copyTds = () => {
    return gulp.src([`${config.es}/**/*.d.ts`]).pipe(gulp.dest(config.cjs));
}
export default series(clean, build, copyTds)
