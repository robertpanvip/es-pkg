import type {BuildOptions} from 'esbuild'
import {build} from 'esbuild'
import path from 'path'

async function main() {
    const buildOptions:BuildOptions ={
        absWorkingDir: process.cwd(),
        entryPoints:[path.join(process.cwd(), 'run.ts')],
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
}

main().catch(err => {
    console.error(err);
    process.exit()
})