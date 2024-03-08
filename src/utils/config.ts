import fs from "node:fs";
import path from "node:path";

const appDirectory = fs.realpathSync(process.cwd());

export const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

export const pkg = JSON.parse(fs.readFileSync(resolveApp('package.json'), 'utf-8'))

export const getJson = (relativePath: string) => {
    try {
        return JSON.parse(fs.readFileSync(resolveApp(relativePath), 'utf-8'))
    } catch (err) {
        return {}
    }
}

function isFileExists(filePath: string) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
}

const esPkgInfo = getJson('espkg.json')

export const config = {
    lib: "./lib",
    es: "./es",
    dist: "./dist",
    src: "./src",
    typings: "./typings",
    entry: `./src/index.tsx`,
    entryCss: [],
    publishDir: `../${pkg.name}-npm`,
    ...esPkgInfo,
}
export const resolveConfig = async () => {
    const configPath = resolveApp('espkg.config.ts')
    const pkgConfigPath = resolveApp('pkg.config.ts')
    if (isFileExists(pkgConfigPath)) {
        const res = require(pkgConfigPath)
        Object.assign(config, res.default)
    }
    if (isFileExists(configPath)) {
        const res = require(configPath)
        Object.assign(config, res.default)
    }
}