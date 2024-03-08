import gulp, {series, parallel} from "../gulp";
import logger from "../logger";
import plumber from "gulp-plumber"
import ts from "gulp-typescript"
import typescript from "typescript"
import babel from "gulp-babel"
import gulpSass from "gulp-sass";
import rename from "gulp-rename";
import autoPreFixer from "gulp-autoprefixer"
import Sass from "sass";
import {remove} from "../utils/util";
import {error, log} from "../utils/log";
import {config, getJson, resolveApp} from "../utils/config";

const sass = gulpSass(Sass)

const clean = async () => {
    log(`清除 ${config.es} & ${config.lib} 目录---开始`)
    await remove(config.es, true);
    await remove(config.lib, true);
    log(`清除 ${config.es} & ${config.lib} 目录---结束`)
}

const dealScss = () => {
    const copy = (dest: string) => {
        return () => gulp.src(`${config.src}/**/*.scss`)
            .pipe(logger({
                before: `copyScss...`,
                after: 'copyScss complete!',
                extname: '.scss',
                showChange: true
            }))
            .pipe(gulp.dest(dest))
    }
    const compileScss = () => {
        return gulp.src(`${config.src}/**/*.scss`)
            .pipe(sass({outputStyle: 'compressed', outFile: 'xx'}).on('error', sass.logError))
            .pipe(autoPreFixer())
            .pipe(rename((path) => {
                path.extname = ".min.css"
            }))
            .pipe(plumber())
            .pipe(gulp.dest(config.lib));
    }
    return parallel(copy(config.es), copy(config.lib), compileScss)
}


const copyScssToLib = () => {
    return gulp.src(`${config.src}/**/*.scss`)
        .pipe(logger({
            before: 'copyScssToLib...',
            after: 'copyScssToLib complete!',
            extname: '.scss',
            showChange: true
        }))
        .pipe(gulp.dest(config.lib));
}
const compileEs = () => {
    const tsConfig = typescript.readConfigFile(resolveApp('tsconfig.json'), typescript.sys.readFile);
    if (tsConfig.error) {
        console.log(tsConfig.error.messageText);
    }
    return gulp.src([
        `${config.src}/**/*.tsx`,
        `${config.src}/**/*.ts`,
        `${config.typings}/**/*.ts`,
        `!${config.src}/**/__test__/!**`,
    ]).pipe(logger({
        before: 'generate ...es ...',
        after: 'generate ...es complete!',
        extname: '.ts',
        showChange: false,
    }))
        .pipe(ts({
            "jsx": "react",
            "noImplicitAny": true,
            ...tsConfig.config.compilerOptions,
            "removeComments": false,
            "declaration": true,
            "esModuleInterop": true,
            "resolveJsonModule": true,
            "target": "esnext",
            "moduleResolution": 'node',
        }))
        .on('error', () => null)
        .pipe(logger({
            before: 'writing to es...',
            after: 'write  complete!',
            extname: '.ts',
            showChange: true,
            display: 'name'
        }))
        .pipe(plumber())
        .pipe(gulp.dest(config.es));
}
const copyTds = () => {
    return gulp.src([
        `${config.es}/**/*.d.ts`,
    ]).pipe(gulp.dest(config.lib));
}
const compileLib = () => {
    return gulp.src([`${config.es}/**/*.js`])
        .pipe(logger({
            before: 'Starting translate ...',
            after: 'translate complete!',
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
            before: 'write js ...',
            after: 'write js complete!',
            extname: '.js',
            showChange: true
        }))
        .pipe(gulp.dest(config.lib))
}

const compileEsAndLib = series(compileEs, copyTds, compileLib)

export default series(clean, parallel(dealScss(), copyScssToLib, compileEsAndLib))
