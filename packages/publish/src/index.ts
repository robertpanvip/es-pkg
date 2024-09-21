import gulp, {series} from '@es-pkg/gulp'
import chalk from 'chalk';// 改变屏幕文字颜色
import logger from '@es-pkg/gulp-logger'
import fs from "fs"
import path from "path";
import {autoUpgrade, compare, remove, run, error, log, success} from "@es-pkg/utils";
import {config, getEntrypoint, pkg, resolveApp} from "@es-pkg/config";
import prompts from "prompts"

const scoped = /^@[a-zA-Z0-9-]+\/.+$/;
const REGISTRY = "https://registry.npmjs.org"

const json: Record<string, string | object> = pkg;

const publishDir = path.join(config.publishDir, './__npm__')

gulp.task('clean', async (cb) => {
    log(`清除${publishDir}开始`)
    try {
        await remove(publishDir);
        log(`清除${publishDir}完成`)
    } catch (e) {
        log(`清除${publishDir}失败：`, e)
    }
    cb();
});
gulp.task('del-cjs-iife-es', async (cb) => {
    log(`删除 ${path.join(`${publishDir}`, config.iife)} 开始`)
    await remove(`${path.join(`${publishDir}`, config.iife)}`);
    log(`删除 ${path.join(`${publishDir}`, config.iife)} 结束`)

    log(`删除 ${path.join(`${publishDir}`, config.cjs)} 开始`)
    await remove(`${path.join(`${publishDir}`, config.cjs)}`);
    log(`删除 ${path.join(`${publishDir}`, config.cjs)} 结束`)

    log(`删除 ${path.join(`${publishDir}`, config.es)} 开始`)
    await remove(`${path.join(`${publishDir}`, config.es)}`);
    log(`删除 ${path.join(`${publishDir}`, config.es)} 结束`)
    cb();
});
gulp.task('copy-info', async () => {
    log(`生成 package 开始`);
    const controller = new AbortController();
    const {default: fetch} = await import("node-fetch");
    let errored = false;
    try {
        const timer = setTimeout(() => {
            controller.abort()
        }, 2000)
        const response = await fetch(`https://registry.npmjs.org/${pkg.name}`, {
            signal: controller.signal,
        })
        clearTimeout(timer);
        const res = await response.json() as { "dist-tags": { latest: string }, "error": string };
        if (res["error"] === 'Not found') {
            log(`未获取到远程获取版本信息`, JSON.stringify(res))
            json.version = pkg.version;
        } else {
            log(`远程获取版本信息 tag:`, res["dist-tags"].latest)
            if (res["dist-tags"]) {
                json.version = compare(pkg.version, res["dist-tags"].latest) <= 0 ? autoUpgrade(res["dist-tags"].latest) : pkg.version
            } else {
                errored = true;
            }
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
    const es = path.basename(config.es);
    const cjs = path.basename(config.cjs)
    const iife = path.basename(config.iife)
    const CJSExists = fs.existsSync(path.join(`${publishDir}`, cjs))
    const ESExists = fs.existsSync(path.join(`${publishDir}`, es))
    const IIFEExists = fs.existsSync(path.join(`${publishDir}`, iife))
    const mainExists = !!json.main && fs.existsSync(path.join(resolveApp(''), json.main as string))
    const browserExists = !!json.browser && fs.existsSync(path.join(resolveApp(''), json.main as string))
    const moduleExists = !!json.module && fs.existsSync(path.join(resolveApp(''), json.main as string))

    if (!mainExists) {
        if (ESExists) {
            json.main = getEntrypoint(config.es)
        }
        if (CJSExists) {
            json.main = getEntrypoint(config.cjs)
        }
    }
    if (!moduleExists && CJSExists) {
        json.module = getEntrypoint(config.es)
    }
    if (!browserExists && IIFEExists) {
        json.browser = getEntrypoint(config.iife)
    }
    if (!json.types) {
        json.types = path.basename(config.typings)
    }
    json.files = [ESExists && es, CJSExists && cjs, IIFEExists && iife].filter(Boolean)

    json.dependencies = Object.fromEntries(Object.entries(json.dependencies).map(([key, value]) => {
        if (value.startsWith('file://') || value.startsWith('workspace:')) {
            return [key, 'latest']
        }
        return [key, value]
    }))

    let jsonStr = JSON.stringify(json, null, "\t")
    const ex = fs.existsSync(`${publishDir}/`)
    if (!ex) {
        fs.mkdirSync(`${publishDir}/`, {recursive: true})
    }
    fs.writeFileSync(`${publishDir}/package.json`, jsonStr)
    log(`生成 package完成`, chalk.green(json.version))

    log(`生成 .npmrc 开始`)
    fs.writeFileSync(`${publishDir}/.npmrc`, `registry=${REGISTRY}`)
    log(`生成 .npmrc 完成`,)

    log(`拷贝 README 开始`)
    return gulp.src([`./README.md`], {allowEmpty: true})
        .pipe(logger({
            before: 'copy README...',
            after: 'copy README complete!',
            showChange: false
        }))
        .pipe(gulp.dest(`${publishDir}/`));
});

gulp.task('copy-iife', () => {
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
    const promises = [remove(config.es), remove(config.cjs), remove(config.iife)];
    return Promise.all(promises)
}, () => {
    return gulp.src([`${publishDir}/.**`, `${publishDir}/**`])
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
        log.warn("===npm未登录！！请登录")
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

export default gulp.series('clean', 'del-cjs-iife-es', 'copy-cjs', 'copy-es', 'copy-iife', 'copy-info', 'remove-__npm__', 'npm-publish')