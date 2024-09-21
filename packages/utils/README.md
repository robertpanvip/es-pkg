   

@es-pkg/utils
=============

gulp node执行

[![NPM Version](https://img.shields.io/npm/v/@es-pkg/utils?color=33cd56&logo=npm)](https://www.npmjs.com/package/@es-pkg/utils)  [![NPM Version](https://img.shields.io/npm/dm/@es-pkg/utils.svg?style=flat-square)](https://www.npmjs.com/package/@es-pkg/utils)  [![unpacked size](https://img.shields.io/npm/unpacked-size/@es-pkg/utils?color=green)](https://www.npmjs.com/package/@es-pkg/utils)  [![Author](https://img.shields.io/badge/docs_by-pan-blue)](https://github.com/robertpanvip/es-pkg.git)

📦 **Installation**
-------------------

    npm install @es-pkg/utils

🏠 Exports
----------

### 

|参数|类型|
|---|---|
|🎗️autoUpgrade|`Functions`|
|🎗️compare|`Functions`|
|🎗️error|`Functions`|
|🎗️getValidPkgName|`Functions`|
|🎗️info|`Functions`|
|🎗️isDirectory|`Functions`|
|🎗️isValidHttp|`Functions`|
|🎗️log|`Functions`|
|🎗️remove|`Functions`|
|🎗️run|`Functions`|
|🎗️step|`Functions`|
|🎗️success|`Functions`|
|🎗️titleCase|`Functions`|
|🎗️warn|`Functions`|

**🎗️Functions**
----------------

  
  

#### autoUpgrade

*   autoUpgrade(str:`string`): `string`

  
  

#### compare

*   版本号比较大小  
      
    
*   compare(v1:`string`, v2:`string`): `number`

  
  

#### error

*   error(content:`string`, ...rest:`any`\[\]): `void`

  
  

#### getValidPkgName

*   getValidPkgName(str:`string`): `string`

  
  

#### info

*   info(content:`string`, ...rest:`any`\[\]): `void`

  
  

#### isDirectory

*   isDirectory(path:`string`): `boolean`

  
  

#### isValidHttp

*   isValidHttp(url:`string`): `boolean`

  
  

#### log

*   log(content:`string`, ...rest:`any`\[\]): `void`

|参数|类型|说明|默认值|
|---|---|---|---|
|debug|: typeof `log`|||
|error|: ((content:`string`, ...rest:`any`\[\]) => `void`)|||
|info|: ((content:`string`, ...rest:`any`\[\]) => `void`)|||
|success|: ((content:`string`, ...rest:`any`\[\]) => `void`)|||
|warn|: ((content:`string`, ...rest:`any`\[\]) => `void`)|||

  
  

#### remove

*   删除文件或者文件夹  
      
    
*   remove(url:`string`, folders?:`boolean`): `Promise`<`void`\>

  
  

#### run

*   run(bin:`string`, args:`string`\[\], opts?:`Options`<`string`\>): `Promise`<`ExecaReturnValue`<`string`\>\>

  
  

#### step

*   step(msg:`string`): `void`

  
  

#### success

*   success(content:`string`, ...rest:`any`\[\]): `void`

  
  

#### titleCase

*   titleCase(str:`string`): `string`

  
  

#### warn

*   warn(content:`string`, ...rest:`any`\[\]): `void`