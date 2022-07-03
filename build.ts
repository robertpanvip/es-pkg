import type {BuildOptions} from 'esbuild'
import {build} from 'esbuild'
import fs from 'fs'
import path from 'path'
export const resolveApp = (relativePath: string) => path.resolve(fs.realpathSync(process.cwd()), relativePath);

function getAllFiles(root: string) {
    let res: string[] = [];
    const files = fs.readdirSync(root);
    files.forEach(function (file) {
        const pathname = path.join(root, file);
        const stat = fs.lstatSync(pathname);

        if (!stat.isDirectory()) {
            res.push(pathname);
        } else {
            res = res.concat(getAllFiles(pathname));
        }
    });
    return res
}

async function main() {
    let entryPoints = getAllFiles(path.join(process.cwd(), 'src'));
    entryPoints = entryPoints.filter(item => item !== path.join(process.cwd(), 'src/build.ts'))
    const buildOptions:BuildOptions ={
        absWorkingDir: process.cwd(),
        entryPoints,
        bundle: false,
        platform: 'node',
        format: 'cjs',
        target:'node8',
        splitting: false,
        sourcemap: false,
        outdir: 'bin',
        ignoreAnnotations: false,
    }
    await build(buildOptions)
    let res = fs.readFileSync(resolveApp("bin/utils/util.js"), 'utf-8');
    res = res.replace('Promise.resolve().then(() => __toESM(require("execa")))','import("execa")')
    fs.writeFileSync('bin/utils/util.js',res,'utf-8')
}

main().catch(err => {
    console.error(err);
    process.exit()
})