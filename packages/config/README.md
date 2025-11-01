   

@es-pkg/config
==============

gulp 配置

[![NPM Version](https://img.shields.io/npm/v/@es-pkg/config?color=33cd56&logo=npm)](https://www.npmjs.com/package/@es-pkg/config)  [![NPM Version](https://img.shields.io/npm/dm/@es-pkg/config.svg?style=flat-square)](https://www.npmjs.com/package/@es-pkg/config)  [![unpacked size](https://img.shields.io/npm/unpacked-size/@es-pkg/config?color=green)](https://www.npmjs.com/package/@es-pkg/config)  [![Author](https://img.shields.io/badge/docs_by-pan-blue)](https://github.com/robertpanvip/@es-pkg/execute.git)

📦 **Installation**
-------------------

    npm install @es-pkg/config

🏠 Exports
----------

### 

|参数|类型|
|---|---|
|🔖default|`References`|
|📒EsPkgConfig|`Interfaces`|
|☀️config|`Variables`|
|☀️pkg|`Variables`|
|☀️shallowInputs|`Variables`|
|🎗️defineConfig|`Functions`|
|🎗️getDirectoryIndexPath|`Functions`|
|🎗️getEntrypoint|`Functions`|
|🎗️getIncludeFiles|`Functions`|
|🎗️getIndexFilePath|`Functions`|
|🎗️getJson|`Functions`|
|🎗️getNpmEntry|`Functions`|
|🎗️relativeToApp|`Functions`|
|🎗️resolveApp|`Functions`|
|🎗️resolveConfig|`Functions`|

**🔖References**
----------------

  
  

#### default

Renames and re-exports defineConfig

**📒Interfaces**
----------------

  
  

EsPkg配置  
  

#### EsPkgConfig

|参数|类型|说明|默认值|
|---|---|---|---|
|cjs|?: `string`|cjs 目录|默认为./npm/cjs|
|css|\|参数\|类型\|说明\|默认值\|
\|---\|---\|---\|---\|
\|browserslist\|?: `string`\[\]\|autoprefixer browserslist\|默认为\['last 2 versions'\]\|
\|extra\|?: `string`\[\]\|额外包含的css文件 @default默认为\[\]\|\|
\|extract\|?: `string` \\| `boolean`\|输出配置：提取为单独的 CSS 文件（推荐） 可选：不提取，嵌入到 JS 中（通过 import 会生成 style 标签）\|默认为${name}.min.css\||||
|doc|?: `string` \| `Partial`<`DocOptions`\>|md文档名称|默认为 README|
|entry|?: `string`|入口|默认为./src|
|es|?: `string`|es 目录|默认为./npm/es|
|iife|?: `string`|iife 目录|默认为./npm/dist|
|include|?: `string`\[\]|包含的文件|默认为./src|
|publishAccess|?: \[`string`, `string`\]|||
|publishDir|?: `string`|npm发布目录|默认为../npm|
|publishRegistry|?: `string`|发布仓库 默认https://registry.npmjs.org\*||
|typings|?: `string`|声明 目录|默认为./typings|

**☀️Variables**
---------------

  
  

#### `Const` config

: `Required`<`EsPkgConfig`\> = ...

  
  

#### `Const` pkg

: `any` = ...

  
  

#### `Const` shallowInputs

: `string`\[\] = ...

**🎗️Functions**
----------------

  
  

#### defineConfig

*   配置自定义  
      
    
*   defineConfig(config:`EsPkgConfig`): `EsPkgConfig`

  
  

#### getDirectoryIndexPath

*   getDirectoryIndexPath(dir:`string`): `string`

  
  

#### getEntrypoint

*   getEntrypoint(basePath:`string`, entry?:`string`): `string`

  
  

#### getIncludeFiles

*   getIncludeFiles(): {  
      
        isDirectory: `boolean`;  
      
        path: `string`;  
      
    }\[\]

  
  

#### getIndexFilePath

*   getIndexFilePath(\_path:`string`): `string`

  
  

#### getJson

*   getJson(relativePath:`string`): `any`

  
  

#### getNpmEntry

*   getNpmEntry(entry:`string`, \_basePath:`string`): `string`

  
  

#### relativeToApp

*   relativeToApp(relativePath:`string`): `string`

  
  

#### resolveApp

*   resolveApp(relativePath:`string`): `string`

  
  

#### resolveConfig

*   resolveConfig(): `Promise`<`void`\>