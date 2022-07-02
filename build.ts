import type {BuildOptions} from 'esbuild'
import {build} from 'esbuild'
import fs from 'fs'
import path from 'path'

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
        splitting: false,
        sourcemap: false,
        outdir: 'bin',
        ignoreAnnotations: false,
    }
    await build(buildOptions)
}

main().catch(err => {
    console.error(err);
    process.exit()
})