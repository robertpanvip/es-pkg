import gulp from '../gulp'
import chalk from 'chalk';// 改变屏幕文字颜色
import logger from '../logger'
import fs from "fs"
import path from "path";
import { autoUpgrade, compare, remove, run } from "../utils/util";
import { error, log, success } from "../utils/log";
import { config, pkg } from "../utils/config";
import prompts from "prompts"

const scoped = /^@[a-zA-Z0-9-]+\/.+$/;
const REGISTRY = "https://registry.npmjs.org"

const json: Record<string, string | object> = pkg;

gulp.task('clean', async (cb) => {
    log(`清除${config.publishDir}开始`)
    try {
        await remove(config.publishDir);
        log(`清除${config.publishDir}完成`)
    } catch (e) {
        log(`清除${config.publishDir}失败：`, e)
    }
    cb();
});
gulp.task('del-dist', async (cb) => {
    log(`删除 ${path.join(`${config.publishDir}`, config.dist)} 开始`)
    await remove(`${path.join(`${config.publishDir}`, config.dist)}`);
    log(`删除 ${path.join(`${config.publishDir}`, config.dist)} 结束`)

    log(`删除 ${path.join(`${config.publishDir}`, config.lib)} 开始`)
    await remove(`${path.join(`${config.publishDir}`, config.lib)}`);
    log(`删除 ${path.join(`${config.publishDir}`, config.lib)} 结束`)

    log(`删除 ${path.join(`${config.publishDir}`, config.es)} 开始`)
    await remove(`${path.join(`${config.publishDir}`, config.es)}`);
    log(`删除 ${path.join(`${config.publishDir}`, config.es)} 结束`)
    cb();
});
gulp.task('copy-info', async () => {
    log(`生成 package 开始`)
    const { default: fetch } = await import("node-fetch");
    let errored = false;
    try {
        const response = await fetch(`https://registry.npmjs.org/${pkg.name}`)
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
        const { version } = await prompts({
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
    if (!json.main) {
        json.main = config.es
    }
    if (!json.types) {
        json.types = config.typings
    }
    let jsonStr = JSON.stringify(json, null, "\t")
    const ex = fs.existsSync(`${config.publishDir}/`)
    if (!ex) {
        fs.mkdirSync(`${config.publishDir}/`, { recursive: true })
    }
    fs.writeFileSync(`${config.publishDir}/package.json`, jsonStr)
    log(`生成 package完成`, chalk.green(json.version))

    log(`生成 .npmrc 开始`)
    fs.writeFileSync(`${config.publishDir}/.npmrc`, `registry=${REGISTRY}`)
    log(`生成 .npmrc 完成`,)

    log(`拷贝 README 开始`)
    return gulp.src([`./README.md`])
        .pipe(logger({
            before: 'copy package.json...',
            after: 'copy package.json complete!',
            showChange: false
        }))
        .pipe(gulp.dest(`${config.publishDir}/`));
});

gulp.task('copy-dist', () => {
    log(`拷贝 '/dist/**' 开始`)
    return gulp.src([`${config.dist}/.**`, `${config.dist}/**`])
        .pipe(logger({
            before: 'copy dist...',
            after: 'copy dist complete!',
            showChange: false
        }))
        .pipe(gulp.dest(path.join(`${config.publishDir}`, config.dist)));
});
gulp.task('copy-lib', () => {
    return gulp.src([`${config.lib}/.**`, `${config.lib}/**`])
        .pipe(logger({
            before: 'copy lib...',
            after: 'copy lib complete!',
            showChange: false
        }))
        .pipe(gulp.dest(path.join(`${config.publishDir}`, config.lib)));
});
gulp.task('copy-es', () => {
    return gulp.src([`${config.es}/.**`, `${config.es}/**`])
        .pipe(logger({
            before: 'copy es...',
            after: 'copy es complete!',
            showChange: false
        }))
        .pipe(gulp.dest(path.join(`${config.publishDir}`, config.es)));
});

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
        const { stdout } = await run(`npm`, ["whoami", '--registry', REGISTRY], { stdio: undefined })
        log.warn(`===npm登录信息===>${stdout}`)
    } catch (e) {
        log.warn("===npm未登录！！请登录")
        await run(`npm`, ["login", '--registry', REGISTRY])
    };
    const { confirm } = await prompts({
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

export default gulp.series('clean', 'del-dist', 'copy-info', 'copy-dist', 'copy-es', 'copy-lib', 'npm-publish')