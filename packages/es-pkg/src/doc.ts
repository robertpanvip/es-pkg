import fs from 'fs'
import path from 'path'
import {series} from "@es-pkg/gulp";
import docGen from "@es-pkg/doc"
import {config, pkg as packageJSon} from "@es-pkg/config";
import type {DocOptions} from '@es-pkg/doc'
import {log, error} from "@es-pkg/utils";
//[![NPM Version](https://img.shields.io/npm/v/${packageJSon.name}?color=33cd56&logo=npm)](https://www.npmjs.com/package/${packageJSon.name})
const cwd = process.cwd();

async function doc() {
    if (!config.entry && config.include.length !== 1) {
        error('请指定入口文件')
        return
    }
    const file = path.join(cwd, config.entry || config.include[0]);
    const start = Date.now();
    const docName = (config.doc as DocOptions)?.outName || "README"
    log('开始生成README文件 ---- ')
    try {
        fs.unlinkSync(path.join(cwd, `${docName}.md`))
    } catch (e) {
    }
    docGen({
        name: packageJSon.name,
        desc: packageJSon.description,
        tsconfig: path.join(cwd, './tsconfig.json'),
        entry: file,
        outDir: path.join(cwd, './'),
        outType: "md",
        outName: docName,
        ...(typeof config.doc === 'string' ? {} : config.doc),
    })
    log(`已成功生成${docName}文件`)
}

export default series(doc)