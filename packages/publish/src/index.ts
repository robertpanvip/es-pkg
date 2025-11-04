import gulp, {series} from '@es-pkg/gulp'
import chalk from 'chalk';// 改变屏幕文字颜色
import logger from '@es-pkg/gulp-logger'
import fs from "fs"
import path from "path";
import {autoUpgrade, compare, remove, run, error, log, success, fetch} from "@es-pkg/utils";
import {config, getPublishedEntry, getIncludeFiles, pkg, resolveApp, resolvePublishedPath} from "@es-pkg/config";
import prompts from "prompts"

const scoped = /^@[a-zA-Z0-9-]+\/.+$/;
const REGISTRY = config.publishRegistry

const json: Record<string, string | object> = pkg;

const publishDir = path.join(config.publishDir, './__npm__')

gulp.task('clean', async () => {
    log(`清除${publishDir}开始`)
    try {
        await remove(publishDir);
        log(`清除${publishDir}完成`)
    } catch (e) {
        log(`清除${publishDir}失败：`, e)
    }
});
gulp.task('del-cjs-iife-es', async () => {
    if (config.iife) {
        log(`删除 ${path.join(`${publishDir}`, config.iife)} 开始`)
        await remove(`${path.join(`${publishDir}`, config.iife)}`);
        log(`删除 ${path.join(`${publishDir}`, config.iife)} 结束`)
    }

    log(`删除 ${path.join(`${publishDir}`, config.cjs)} 开始`)
    await remove(`${path.join(`${publishDir}`, config.cjs)}`);
    log(`删除 ${path.join(`${publishDir}`, config.cjs)} 结束`)

    log(`删除 ${path.join(`${publishDir}`, config.es)} 开始`)
    await remove(`${path.join(`${publishDir}`, config.es)}`);
    log(`删除 ${path.join(`${publishDir}`, config.es)} 结束`)
});
gulp.task('copy-info', series(async () => {
    log(`生成 package 开始`);
    let errored = false;
    let version: string | void = "";
    try {
        const {stdout} = await run(`npm`, ['view', pkg.name, 'version'], {
            stdio: undefined,
            cwd: path.join(process.cwd(), config.publishDir),
        });
        if (stdout) {
            version = stdout
        }
        if (!version) {
            const controller = new AbortController();
            const timer = setTimeout(() => {
                controller.abort()
            }, 3000);
            const start = Date.now();
            const url = `https://img.shields.io/npm/v/${pkg.name}`

            const response = await fetch(url, {
                signal: controller.signal
            }).finally(async () => {
                log.warn(`远程获取版本花费时间:${Date.now() - start}`)
            });
            const htmlString = await response.text();
            const regex = /<title>npm: v([\d.]+)<\/title>/;
            version = htmlString.match(regex)?.[1];
            clearTimeout(timer);
        }
        log(`远程获取版本信息 tag:`, version)
        if (version) {
            json.version = compare(pkg.version, version) <= 0 ? autoUpgrade(version) : pkg.version
        } else {
            errored = true;
        }
    } catch (e) {
        errored = true;
    }
    if (errored) {
        const {version} = await prompts({
            type: 'text',
            name: 'version',
            message: '远程获取版本失败！请输入版本号',
            initial: pkg.version
        });
        json.version = version;
    }

    delete json.devDependencies;
    delete json.scripts;
    if (!json.publishConfig) {
        json.publishConfig = {
            access: "public",
            registry: REGISTRY
        }
    }

    const publishDir = resolveApp(config.publishDir);
    const es = path.basename(config.es);
    const cjs = path.basename(config.cjs);
    const iife = config.iife ? path.basename(config.iife) : "";

    const has = {
        es: fs.existsSync(path.join(publishDir, es)),
        cjs: fs.existsSync(path.join(publishDir, cjs)),
        iife: iife && fs.existsSync(path.join(publishDir, iife)),
        main: !!json.main && fs.existsSync(resolveApp(json.main as string)),
        module: !!json.module && fs.existsSync(resolveApp(json.module as string)),
        browser: !!json.browser && fs.existsSync(resolveApp(json.browser as string)),
    };

// 延迟获取已发布入口
    const entry = (base: string, sub = config.entry) => getPublishedEntry(base, sub);

// 自动补全 main
    if (!has.main) {
        json.main = entry(config.cjs) || entry(config.es);
    } else {
        json.main = resolvePublishedPath(json.main as string, "cjs")
    }

// 自动补全 module
    if (!has.module && has.es) {
        json.module = entry(config.es)!;
    } else {
        json.module = resolvePublishedPath(json.main as string, "es")
    }

// 自动补全 browser
    if (!has.browser && has.iife) {
        json.browser = entry(config.iife!, 'es')!;
    } else {
        json.browser = resolvePublishedPath(json.main as string)
    }

// 自动补全 types
    if (!json.types) {
        const typeEntry = getPublishedEntry(config.es, config.typings) || (has.es ? entry(config.es) : has.cjs ? entry(config.cjs) : '');
        if (typeEntry) {
            const {dir, name, ext} = path.parse(typeEntry);
            json.types = ['.ts', '.tsx'].includes(ext) ? typeEntry : `${dir}/${name}.d.ts`;
        }
    } else {
        json.types = resolvePublishedPath(json.types as string, 'es')
    }

// files 去重
    json.files = Array.from(new Set([has.es && es, has.cjs && cjs, has.iife && iife])).filter(Boolean);

    if (json.dependencies) {
        json.dependencies = Object.fromEntries(Object.entries(json.dependencies).map(([key, value]) => {
            if (value.startsWith('file://') || value.startsWith('workspace:')) {
                return [key, 'latest']
            }
            return [key, value]
        }))
    }

    let jsonStr = JSON.stringify(json, null, "\t")
    const ex = fs.existsSync(`${config.publishDir}/`)
    if (!ex) {
        fs.mkdirSync(`${config.publishDir}/`, {recursive: true})
    }
    fs.writeFileSync(`${config.publishDir}/package.json`, jsonStr)
    log(`生成 package完成`, chalk.green(json.version))

    log(`生成 .npmrc 开始`)
    fs.writeFileSync(`${config.publishDir}/.npmrc`, `registry=${REGISTRY}`)
    log(`生成 .npmrc 完成`)

    log(`拷贝 README 开始`)
}, () => {
    return gulp.src([`./README.md`])
        .pipe(logger({
            before: 'copy README...',
            after: 'copy README complete!',
            showChange: false
        }))
        .pipe(gulp.dest(`${config.publishDir}/`))
}));

gulp.task('copy-iife', (c) => {
    if (!config.iife) {
        return c()
    }
    log(`拷贝 '/iife/**' 开始`)
    return gulp.src([`${config.iife}/.**`, `${config.iife}/**`])
        .pipe(logger({
            before: 'copy iife...',
            after: 'copy iife complete!',
            showChange: false
        }))
        .pipe(gulp.dest(path.join(`${publishDir}`, path.basename(config.iife))));
});
gulp.task('copy-cjs', () => {
    return gulp.src([`${config.cjs}/.**`, `${config.cjs}/**`])
        .pipe(logger({
            before: 'copy cjs...',
            after: 'copy cjs complete!',
            showChange: false
        }))
        .pipe(gulp.dest(path.join(`${publishDir}`, path.basename(config.cjs))));
});
gulp.task('copy-es', () => {
    return gulp.src([`${config.es}/.**`, `${config.es}/**`])
        .pipe(logger({
            before: 'copy es...',
            after: 'copy es complete!',
            showChange: false
        }))
        .pipe(gulp.dest(path.join(`${publishDir}`, path.basename(config.es))));
});

gulp.task('remove-__npm__', series(() => {
    let promises: Promise<void>[] = [];
    const includes = [config.es, config.cjs, config.iife].flatMap(val => {
        if (!val) {
            return []
        }
        const some = getIncludeFiles().some(item => path.resolve(val).startsWith(path.resolve(item.path)))
        return some ? [] : [val]
    })
    promises = includes.map(item => remove(item))
    return Promise.all(promises)
}, () => {
    return gulp.src([`${publishDir}/**`, `${publishDir}/.**`])
        .pipe(logger({
            before: 'copy __npm__...',
            after: 'copy __npm__ complete!',
            showChange: false
        }))
        .pipe(gulp.dest(`${config.publishDir}/`))
}, async () => {
    await remove(publishDir)
}));

gulp.task('npm-publish', async function () {

    let publishAccess: string[] = [];
    //公共包
    if (scoped.test(pkg.name)) {
        publishAccess = ["--access", "public"]
    }
    if (config.publishAccess) {
        publishAccess = config.publishAccess;
    }
    try {
        const {stdout} = await run(`npm`, ["whoami", '--registry', REGISTRY], {stdio: undefined})
        log.warn(`===npm登录信息===>${stdout}`)
    } catch (e) {
        log.warn(`===npm${REGISTRY}未登录！！请登录`)
        await run(`npm`, ["login", '--registry', REGISTRY])
    }
    const {confirm} = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: '是否发布？',
    });

    if (confirm) {
        await run(`npm`, ['publish', ...publishAccess, '--registry', REGISTRY], {
            cwd: path.join(process.cwd(), config.publishDir),
        });
        success(`${json.name}@${json.version}:发布成功！`)
    } else {
        error(`${json.name}@${json.version}:取消成功！`)
    }
});

export default gulp.series('clean', 'del-cjs-iife-es', 'copy-cjs', 'copy-es', 'copy-iife', 'remove-__npm__', 'copy-info', 'npm-publish')