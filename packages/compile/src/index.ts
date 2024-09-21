import gulp, {series, parallel} from "@es-pkg/gulp";
import logger from "@es-pkg/gulp-logger";
import plumber from "gulp-plumber"
import ts from "gulp-typescript"
import typescript from "typescript"
import babel from "gulp-babel"
import gulpSass from "gulp-sass";
import rename from "gulp-rename";
import autoPreFixer from "gulp-autoprefixer"
import Sass from "sass";
import {remove, log} from "@es-pkg/utils";
import {config, getTsconfigIncludeFiles, relativeToApp, resolveApp} from "@es-pkg/config";
import path from "path";

const sass = gulpSass(Sass)
const include = getTsconfigIncludeFiles()

function getMatchFiles(callback: (path: string) => (string[]) | string, contains: boolean = true) {
    return include.flatMap(item => {
        if (contains && !item.isDirectory) {
            return [item.path]
        }
        const res = callback(item.path);
        return Array.isArray(res) ? res : [res]
    })
}

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


const dealScss = () => {
    const copy = (dest: string) => {
        return () => gulp.src(
            getMatchFiles((path) => `${path}/**/*.scss`, false)
        ).pipe(logger({
            before: `copyScss...`,
            after: 'copyScss complete!',
            extname: '.scss',
            showChange: true
        }))
            .pipe(gulp.dest(dest))
    }
    const compileScss = () => {
        return gulp.src(
            getMatchFiles((path) => `${path}/**/*.scss`, false)
        )
            .pipe(sass({outputStyle: 'compressed', outFile: 'xx'}).on('error', sass.logError))
            .pipe(autoPreFixer())
            .pipe(rename((path) => {
                path.extname = ".min.css"
            }))
            .pipe(plumber())
            .pipe(gulp.dest(config.cjs));
    }
    return parallel(copy(config.es), copy(config.cjs), compileScss)
}


const copyScssToLib = () => {
    return gulp.src(
        getMatchFiles((path) => [`${path}/**/*.scss`, `${path}/**/*.less`], false)
    )
        .pipe(logger({
            before: 'copyScssToLib...',
            after: 'copyScssToLib complete!',
            extname: '.scss',
            showChange: true
        }))
        .pipe(gulp.dest(config.cjs));
}
const compileEs = () => {
    const tsConfig = typescript.readConfigFile(resolveApp('tsconfig.json'), typescript.sys.readFile);
    if (tsConfig.error) {
        console.log(tsConfig.error.messageText);
    }
    const compile = (src: string[], target: string) => {
        return gulp.src(src)
            .pipe(logger({
                before: 'generate ...es ...',
                after: 'generate ...es complete!',
                extname: '.ts',
                showChange: false,
            }))
            .pipe(ts({
                "jsx": "react",
                "noImplicitAny": true,
                ...tsConfig.config.compilerOptions,
                "module": "esnext",
                "target": "esnext",
                "newLine": 'crlf',
                "allowImportingTsExtensions": false,
                "baseUrl": "./",
                "isolatedModules": false,
                "removeComments": false,
                "declaration": true,
                "noEmit": false,
                "esModuleInterop": true,
                "resolveJsonModule": true,
                "skipLibCheck": true,
                "moduleResolution": 'node',
            }))
            .on('error', (e) => {
                console.error(e)
                throw e;
            })
            .pipe(logger({
                before: 'writing to es...',
                after: 'write  complete!',
                extname: '.ts',
                showChange: true,
                display: 'name'
            }))
            .pipe(plumber())
            .pipe(gulp.dest(target))
            .pipe(gulp.src(config.include.map(item => `${item}/**/*.json`)))
            .pipe(gulp.dest(target));
    }

    const tasks = include.map((item) => {
        const isDirectory = item.isDirectory;
        return () => compile(isDirectory ? [
                `${item.path}/**/*`,
                `!${item.path}/**/__test__/!**`,
                `${config.typings}/**/*`,
            ] : [item.path],
            isDirectory && include.length > 1 ?
                path.join(config.es, path.basename(item.path))
                : config.es
        )
    })
    return series(tasks)
}
const copyTds = () => {
    return gulp.src([
        `${config.es}/**/*.d.ts`,
    ]).pipe(gulp.dest(config.cjs));
}
const compileLib = () => {
    return gulp.src([`${config.es}/**/*.js`])
        .pipe(logger({
            before: 'Starting transform ...',
            after: 'transform complete!',
            extname: '.js',
            showChange: true
        }))
        .pipe(babel({
            "presets": [
                [
                    "@babel/preset-env",
                    {
                        "targets": {
                            "chrome": "58",
                            "ie": "9"
                        }
                    }
                ],
                [
                    "@babel/preset-react"
                ]
            ],
            "plugins": ["@babel/plugin-transform-runtime"]
        }))
        .pipe(plumber())
        .pipe(logger({
            before: 'write js ---> ...',
            after: 'write js ---> complete!',
            extname: '.js',
            showChange: true
        }))
        .pipe(gulp.dest(config.cjs))
}

const compileEsAndLib = series(compileEs(), copyTds, compileLib)

export default series(clean, parallel(dealScss(), copyScssToLib, compileEsAndLib))
