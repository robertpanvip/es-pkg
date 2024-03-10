   

es-pkg
======

组件打包工具

[![NPM Version](https://img.shields.io/npm/v/es-pkg?color=33cd56&logo=npm)](https://www.npmjs.com/package/es-pkg)  [![NPM Version](https://img.shields.io/npm/dm/es-pkg.svg?style=flat-square)](https://www.npmjs.com/package/es-pkg)  [![unpacked size](https://img.shields.io/npm/unpacked-size/es-pkg?color=green)](https://www.npmjs.com/package/es-pkg)  [![Author](https://img.shields.io/badge/docs_by-pan-blue)](https://github.com/robertpanvip/es-pkg.git)

📦 **Installation**
-------------------

    npm install es-pkg

🏠 Exports
----------

### 

|参数|类型|
|---|---|
|📒EsPkgConfig|`Interfaces`|
|🎗️defineConfig|`Functions`|

**📒Interfaces**
----------------

  
  

EsPkg配置  
  

#### EsPkgConfig

|参数|类型|说明|默认值|
|---|---|---|---|
|dist|?: `string`|dist 目录|默认为./dist|
|doc|?: `string` \| `Partial`<`DocOptions`\>|md文档名称|默认为 README|
|entry|?: `string`|入口|默认为./src/index.tsx|
|entryCss|?: \[\]|||
|es|?: `string`|es 目录|默认为./es|
|lib|?: `string`|lib 目录|默认为./lib|
|publishDir|?: `string`|npm发布目录|默认为../${pkg.name}-npm|
|src|?: `string`|src 目录|默认为./src|
|typings|?: `string`|声明 目录|默认为./typings|

**🎗️Functions**
----------------

  
  

#### defineConfig

*   配置自定义  
      
    
*   defineConfig(config:`EsPkgConfig`): `EsPkgConfig`