import gulp from 'gulp'
import chalk from 'chalk';// 改变屏幕文字颜色
import logger from 'gulp-logger'
import fs from "fs"
import path from "path";
import {autoUpgrade, compare, config, pkg, remove, run} from "../utils/util";
import {error, log, success} from "../utils/log";

const scoped = /^@[a-zA-Z0-9-]+\/.+$/;

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
    const json: Record<string, string | object> = pkg;
    const {default: fetch} = await import("node-fetch")
    try {
        const response = await fetch(`https://registry.npmjs.org/${pkg.name}`)
        if (response.status === 504) {
            throw new Error(`获取版本号超时`)
        }
        const res = await response.json() as { "dist-tags": { latest: string } };
        log(`远程获取版本信息 tag:`, res["dist-tags"].latest)
        if (res["dist-tags"]) {
            json.version = compare(pkg.version, res["dist-tags"].latest) <= 0 ? autoUpgrade(res["dist-tags"].latest) : pkg.version
        } else {
            error(`获取版本号失败`)
            json.version = pkg.version;
        }
    } catch (e) {
        json.version = pkg.version
        error(`获取版本号失败`, e)
    }


    delete json.devDependencies;
    delete json.scripts;
    if (!json.publishConfig) {
        json.publishConfig = {
            access: "public",
            registry: "https://registry.npmjs.org/"
        }
    }
    let jsonStr = JSON.stringify(json, null, "\t")
    const ex = fs.existsSync(`${config.publishDir}/`)
    if (!ex) {
        fs.mkdirSync(`${config.publishDir}/`, {recursive: true})
    }
    fs.writeFileSync(`${config.publishDir}/package.json`, jsonStr)
    log(`生成 package完成`, chalk.green(json.version))

    log(`生成 .npmrc 开始`)
    fs.writeFileSync(`${config.publishDir}/.npmrc`, `registry=http://registry.npmjs.org`)
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
    return gulp.src([`${config.dist}/**`])
        .pipe(logger({
            before: 'copy dist...',
            after: 'copy dist complete!',
            showChange: false
        }))
        .pipe(gulp.dest(path.join(`${config.publishDir}`, config.dist)));
});
gulp.task('copy-lib', () => {
    return gulp.src([`${config.lib}/**`])
        .pipe(logger({
            before: 'copy lib...',
            after: 'copy lib complete!',
            showChange: false
        }))
        .pipe(gulp.dest(path.join(`${config.publishDir}`, config.lib)));
});
gulp.task('copy-es', () => {
    return gulp.src([`${config.es}/**`])
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

    const {stdout} = await run(`npm`, ["config", 'get', 'registry'], {
        stdout: 'pipe',
        stdio: undefined
    })
    log.warn("npm-registry", stdout)
    if (stdout !== 'http://registry.npmjs.org') {
        await run(`npm`, ["config", 'set', 'registry', 'http://registry.npmjs.org'])
        log.warn("npm-registry-reset", 'http://registry.npmjs.org')
    }
    try {
        log.warn("npm-whoami")
        await run(`npm`, ["whoami"])
        success(["npm", "publish", ...publishAccess].join(' '))
        await run(`npm`, ['publish', ...publishAccess], {cwd: path.join(process.cwd(), config.publishDir)});
    } catch (e) {
        throw e;
    } finally {
        await run(`npm`, ["config", 'set', 'registry', stdout])
    }
});

export default gulp.series('clean', 'del-dist', 'copy-info', 'copy-dist', 'copy-es', 'copy-lib', 'npm-publish')