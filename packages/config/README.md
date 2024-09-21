   

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
|☀️config|`Variables`|
|☀️pkg|`Variables`|
|🎗️default|`Functions`|
|🎗️getDirectoryIndexPath|`Functions`|
|🎗️getEntrypoint|`Functions`|
|🎗️getIndexFilePath|`Functions`|
|🎗️getJson|`Functions`|
|🎗️getTsconfigIncludeFiles|`Functions`|
|🎗️relativeToApp|`Functions`|
|🎗️resolveApp|`Functions`|
|🎗️resolveConfig|`Functions`|

**☀️Variables**
---------------

  
  

#### `Const` config

: `Required`<`EsPkgConfig`\> & {  
  
    include: `string`\[\];  
  
} = ...

  
  

#### `Const` pkg

: `any` = ...

**🎗️Functions**
----------------

  
  

#### defineConfig

*   配置自定义  
      
    
*   defineConfig(config:`EsPkgConfig`): `EsPkgConfig`

  
  

#### getDirectoryIndexPath

*   getDirectoryIndexPath(dir:`string`): `string`

  
  

#### getEntrypoint

*   getEntrypoint(\_dir:`string`): `string`

  
  

#### getIndexFilePath

*   getIndexFilePath(\_path:`string`): `string`

  
  

#### getJson

*   getJson(relativePath:`string`): `any`

  
  

#### getTsconfigIncludeFiles

*   getTsconfigIncludeFiles(): {  
      
        isDirectory: `boolean`;  
      
        path: `string`;  
      
    }\[\]

  
  

#### relativeToApp

*   relativeToApp(relativePath:`string`): `string`

  
  

#### resolveApp

*   resolveApp(relativePath:`string`): `string`

  
  

#### resolveConfig

*   resolveConfig(): `Promise`<`void`\>