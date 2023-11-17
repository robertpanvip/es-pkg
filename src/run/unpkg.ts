import {remove, titleCase, getValidPkgName} from "../utils/util";
import {series, parallel} from 'gulp'
import path from 'path';
import webpack from 'webpack';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import WebpackBar from 'webpackbar';
import {error} from "../utils/log";
import chalk from "chalk";
import formatWebpackMessages from "../utils/formatWebpackMessages";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import {config, pkg} from "../utils/config";

function build(config: webpack.Configuration) {
    console.log('Creating an optimized production build...');
    const compiler = webpack(config);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages;
            if (err) {
                if (!err.message) {
                    return reject(err);
                }

                let errMessage = err.message;

                // Add additional information for postcss errors
                if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
                    errMessage +=
                        '\nCompileError: Begins at CSS selector ' +
                        (err as any)['postcssNode'].selector;
                }

                messages = formatWebpackMessages({
                    errors: [errMessage],
                    warnings: [],
                });
            } else {
                messages = formatWebpackMessages(
                    stats?.toJson({
                        all: true,
                        assets: true,
                        warnings: true,
                        errors: true
                    })
                );
            }
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                return reject(new Error(messages.errors.join('\n\n')));
            }
            if (
                process.env.CI &&
                (typeof process.env.CI !== 'string' ||
                    process.env.CI.toLowerCase() !== 'false') &&
                messages.warnings.length
            ) {
                console.log(
                    chalk.yellow(
                        '\nTreating warnings as errors because process.env.CI = true.\n' +
                        'Most CI servers set it automatically.\n'
                    )
                );
                return reject(new Error(messages.warnings.join('\n\n')));
            }

            const resolveArgs = {
                stats,
                warnings: messages.warnings,
            }

            return resolve(resolveArgs);
        });
    });
}

function webpackCompile(minimize: boolean, name: string, callback: Function) {
    const pkgName=getValidPkgName(pkg.name);
    const plugins = [
        new BundleAnalyzerPlugin({
            analyzerMode: minimize ? 'server' : 'disabled',
        }),
        new webpack.BannerPlugin(`
${pkgName} v${pkg.version}
Copyright 2021-present.
All rights reserved.
      `),
        new WebpackBar({
            name: pkgName + ":" + name,
            color: '#2f54eb',
        }),
    ];
    if (minimize) {
        plugins.push(new MiniCssExtractPlugin())
    }
    build({
        entry: config.entry,
        output: {
            path: path.join(process.cwd(), config.dist),
            filename: name,
            library: titleCase(pkgName),
            libraryTarget: 'umd'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    'targets': {
                                        'browsers': ['ie >= 9', 'chrome >= 62'],
                                    }
                                }
                            ],
                            ['@babel/preset-react'],
                            [
                                "@babel/preset-typescript",
                                {
                                    "isTSX": true,
                                    "allExtensions": true
                                }
                            ],
                        ],
                        plugins: [
                            ["transform-remove-console", {"exclude": ["error", "warn"]}],
                            [
                                "@babel/plugin-transform-runtime"
                            ]
                        ]
                    },
                    include: [
                        path.join(process.cwd(), config.src),
                    ]
                },
                {
                    // 用来匹配 .css 结尾的文件
                    test: /\.css$/,
                    // use 数组里面 Loader 执行顺序是从右到左
                    use: [MiniCssExtractPlugin.loader, "css-loader"],
                },
                {
                    test: /\.less$/,
                    use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
                },
            ]
        },
        mode: 'production',
        optimization: {
            minimize: minimize,
            minimizer: [new CssMinimizerPlugin()]
        },
        externals: {
            'react': "React",
            'react-dom': "ReactDOM",
        },
        plugins
    }).then((res) => {
        const {warnings} = res as { warnings: string[] };
        if (warnings.length) {
            console.log(chalk.yellow('Compiled with warnings.\n'));
            console.log(warnings.join('\n\n'));
            console.log(
                '\nSearch for the ' +
                chalk.underline(chalk.yellow('keywords')) +
                ' to learn more about each warning.'
            );
            console.log(
                'To ignore, add ' +
                chalk.cyan('// eslint-disable-next-line') +
                ' to the line before.\n'
            );
        } else {
            console.log(chalk.green('Compiled successfully.\n'));
        }
        callback();
    }).catch(err => {
        const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
        if (tscCompileOnError) {
            console.log(
                chalk.yellow(
                    'Compiled with the following type errors (you may want to check these before deploying your app):\n'
                )
            );
            callback(err);
            process.exit(1);
        } else {
            console.log(chalk.red('Failed to compile.\n'));
            callback(err);
            process.exit(1);
        }
    }).catch(err => {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    });
}

const clean = async (done: Function) => {
    await remove(config.dist);
    done()
}
const webpackTask = (done: Function) => {
    webpackCompile(false, `${getValidPkgName(pkg.name)}.js`, done)
}
const minimize = (done: Function) => {
    webpackCompile(true, `${getValidPkgName(pkg.name)}.min.js`, done)
}

export default series(clean, parallel(webpackTask, minimize))