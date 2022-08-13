import gulp from 'gulp'
import chalk from 'chalk';// 改变屏幕文字颜色
import logger from 'gulp-logger'
import fs from "fs"
import path from "path";
import {autoUpgrade, config, pkg, remove, run} from "../utils/util";
import {error, log} from "../utils/log";

const scoped = /^@[a-zA-Z0-9]+\/.+$/;

gulp.task('clean', async (cb) => {
    log(`清除${config.publishDir}开始`)
    await remove(config.publishDir);
    log(`清除${config.publishDir}完成`)
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
    const json: Record<string, string> = pkg;
    const {default: fetch} = await import("node-fetch")
    try {
        const response = await fetch(`https://registry.npmjs.org/${pkg.name}`)
        const res = await response.json() as { "dist-tags": { latest: string } }
        if (res["dist-tags"]) {
            json.version = autoUpgrade(res["dist-tags"].latest)
        } else {
            log(`获取版本号失败`)
            json.version = pkg.version
        }
    } catch (e) {
        error(`获取版本号失败`, e)
        throw new Error(`获取版本号失败`)
    }


    delete json.devDependencies;
    delete json.scripts;
    let jsonStr = JSON.stringify(json, null, "\t")
    const ex = fs.existsSync(`${config.publishDir}/`)
    if (!ex) {
        if (scoped.test(pkg.name)) {
            fs.mkdirSync(`${config.publishDir}/`, {recursive: true})
        } else {
            fs.mkdirSync(`${config.publishDir}/`)
        }
    }
    fs.writeFileSync(`${config.publishDir}/package.json`, jsonStr)
    log(`生成 package完成`, chalk.green(json.version))
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
    log.warn("npm-registry")
    await run(`npm`, ["config", 'get', 'registry'])
    log.warn("npm-whoami")
    await run(`npm`, ["whoami"])
    await run(`npm`, ['publish', ...publishAccess], {cwd: path.join(process.cwd(), config.publishDir)});
});

export default gulp.series('clean', 'del-dist', 'copy-info', 'copy-dist', 'copy-es', 'copy-lib', 'npm-publish')