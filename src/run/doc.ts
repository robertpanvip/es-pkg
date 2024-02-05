import fs from 'fs'
import path from 'path'
import {series} from "../gulp";
import * as docGen from "react-docgen-typescript"
import {step} from "../utils/util";
import {renderTable} from "../utils/md";
import {config, pkg as packageJSon} from "../utils/config";

async function doc() {
    step('开始生成README文件 ---- ')
    let docs = docGen.parse(config.entry, {
        savePropValueAsString: true,
    });

    fs.unlinkSync('./README.md')
    const _docs = docs.map(doc => {
        return renderTable(doc)
    })
    let cssInject = '';
    if (Array.isArray(config.entryCss) && config.entryCss.length !== 0 || !Array.isArray(config.entryCss) && config.entryCss) {
        cssInject = `> Note: \`import "${packageJSon.name}/lib/index.scss"\``
    }
    const _md = `
# ${packageJSon.name}

${packageJSon.description}.

[![NPM Version](https://img.shields.io/npm/v/${packageJSon.name}?color=33cd56&logo=npm)](https://www.npmjs.com/package/${packageJSon.name})

📦 **Installation**
\`\`\` javascript
npm install ${packageJSon.name}
\`\`\`
🔨 **Usage**

${cssInject}
see demo

${_docs.join('\n')}
`
    fs.writeFileSync(path.join(process.cwd(), '/README.md'), _md)
    step('已成功生成README文件')
}

export default series(doc)