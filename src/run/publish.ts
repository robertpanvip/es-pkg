import gulp from 'gulp'
import logger from 'gulp-logger'
import {fetchUrl as fetch} from "fetch"
import fs from "fs"
import path from "path";
import {autoUpgrade, config, pkg, remove, run} from "../utils/util";
import {log} from "../utils/log";

//cwd
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
    const json: Record<string, any> = pkg;
    const res: any = await new Promise((resolve, reject) => {
        fetch(`https://www.unpkg.com/${pkg.name}@latest`, (error, meta) => {
            if (!error) {
                resolve({url: meta.finalUrl})
            } else {
                log(`获取版本号失败`)
                reject(error)
            }
        })
    })

    const matches = res.url.match(/@([0-9]*\.[0-9]*\.[0-9])*/)
    res.version = matches[1]
    json.version = res.version ? autoUpgrade(res.version) : pkg.version
    delete json.devDependencies;
    delete json.scripts;
    // @ts-ignore
    let jsonStr = JSON.stringify(json, "", "\t")
    const ex = fs.existsSync(`${config.publishDir}/`)
    if (!ex) {
        fs.mkdirSync(`${config.publishDir}/`)
    }
    fs.writeFileSync(`${config.publishDir}/package.json`, jsonStr)
    log(`生成 package完成`)
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
    log('npm publish--');
    await run(`npm`, ['publish'], {cwd: path.join(process.cwd(), config.publishDir)});
});

export default gulp.series('clean', 'del-dist', 'copy-info', 'copy-dist', 'copy-es', 'copy-lib', 'npm-publish')