import {series} from "gulp";
import * as docGen from "react-docgen-typescript"
import {config, pkg as packageJSon, step} from "../utils/util";
import fs from "fs";
import path from "path";
import {renderTable} from "../utils/md";

async function doc () {
    step('开始生成README文件 ---- ')
    const docs = docGen.parse(config.entry,{
        savePropValueAsString: true,
    });
    const _docs= docs.map(doc=>{
        return renderTable(doc)
    })
    const _md=`
📦 **Installation**
\`\`\` javascript
npm install ${packageJSon.name}
\`\`\`
🔨 **Usage**
> Note: \`import "${packageJSon.name}/lib/index.scss"\`

see demo

${_docs.join('\n')}
`
    fs.writeFileSync(path.join(process.cwd(),'/README.md'), _md)
    step('已成功生成README文件')
}

export default series(doc)