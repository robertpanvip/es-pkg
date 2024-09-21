   

@es-pkg/gulp
============

gulp node执行

[![NPM Version](https://img.shields.io/npm/v/@es-pkg/gulp?color=33cd56&logo=npm)](https://www.npmjs.com/package/@es-pkg/gulp)  [![NPM Version](https://img.shields.io/npm/dm/@es-pkg/gulp.svg?style=flat-square)](https://www.npmjs.com/package/@es-pkg/gulp)  [![unpacked size](https://img.shields.io/npm/unpacked-size/@es-pkg/gulp?color=green)](https://www.npmjs.com/package/@es-pkg/gulp)  [![Author](https://img.shields.io/badge/docs_by-pan-blue)](https://github.com/robertpanvip/es-pkg.git)

📦 **Installation**
-------------------

    npm install @es-pkg/gulp

🏠 Exports
----------

### 

|参数|类型|
|---|---|
|🐕Gulp|`Classes`|
|☀️default|`Variables`|
|🎗️lastRun|`Functions`|
|🎗️parallel|`Functions`|
|🎗️registry|`Functions`|
|🎗️series|`Functions`|
|🎗️task|`Functions`|
|🎗️tree|`Functions`|

**🐕Classes**
-------------

  
  

#### Gulp

|参数|类型|说明|默认值|
|---|---|---|---|
|\_\_constructor|*   new Gulp(): `Gulp`|||
|Gulp|: `undefined` \| typeof `Gulp`|||
|dest|: ((folder:`string` \| ((file:`File`) => `string`), opt?:`DestOptions`) => `__global.NodeJS.ReadWriteStream`) = vfs.dest||vfs.dest|
|src|: ((globs:`string` \| `string`\[\], opt?:`SrcOptions`) => `__global.NodeJS.ReadWriteStream`) = vfs.src||vfs.src|
|symlink|: ((folder:`string` \| ((File:`File`) => `string`), opts?:{}) => `__global.NodeJS.ReadWriteStream`) = vfs.symlink||vfs.symlink|
|watch|*   watch(globs:`GulpClient.Globs`, fn?:`Undertaker.TaskFunction`): `"fs".FSWatcher`

*   watch(globs:`GulpClient.Globs`, opts?:`GulpClient.WatchOptions`, fn?:`Undertaker.TaskFunction`): `"fs".FSWatcher`|||

**☀️Variables**
---------------

  
  

#### `Const` gulp

: `Gulp` = ...

**🎗️Functions**
----------------

  
  

#### lastRun

*   Takes a string or function (task) and returns a timestamp of the last time the task was run successfully. The time will be the time the task started. Returns undefined if the task has not been run.  
      
    
*   lastRun(task:`Undertaker.Task`, timeResolution?:`number`): `number`

  
  

#### parallel

*   Takes a variable amount of strings (taskName) and/or functions (fn) and returns a function of the composed tasks or functions. Any taskNames are retrieved from the registry using the get method. When the returned function is executed, the tasks or functions will be executed in parallel, all being executed at the same time. If an error occurs, all execution will complete.  
      
    
*   parallel(...tasks:`Undertaker.Task`\[\]): `Undertaker.TaskFunction`
*   Takes a variable amount of strings (taskName) and/or functions (fn) and returns a function of the composed tasks or functions. Any taskNames are retrieved from the registry using the get method. When the returned function is executed, the tasks or functions will be executed in parallel, all being executed at the same time. If an error occurs, all execution will complete.  
      
    
*   parallel(tasks:`Undertaker.Task`\[\]): `Undertaker.TaskFunction`

  
  

#### registry

*   Returns the current registry object.  
      
    
*   registry(): `UndertakerRegistry`
*   The tasks from the current registry will be transferred to it and the current registry will be replaced with the new registry.  
      
    
*   registry(registry:`UndertakerRegistry`): `void`

  
  

#### series

*   Takes a variable amount of strings (taskName) and/or functions (fn) and returns a function of the composed tasks or functions. Any taskNames are retrieved from the registry using the get method. When the returned function is executed, the tasks or functions will be executed in series, each waiting for the prior to finish. If an error occurs, execution will stop.  
      
    
*   series(...tasks:`Undertaker.Task`\[\]): `Undertaker.TaskFunction`
*   Takes a variable amount of strings (taskName) and/or functions (fn) and returns a function of the composed tasks or functions. Any taskNames are retrieved from the registry using the get method. When the returned function is executed, the tasks or functions will be executed in series, each waiting for the prior to finish. If an error occurs, execution will stop.  
      
    
*   series(tasks:`Undertaker.Task`\[\]): `Undertaker.TaskFunction`

  
  

#### task

*   Returns the wrapped registered function.  
      
    
*   task(taskName:`string`): `undefined` | `Undertaker.TaskFunctionWrapped`
*   Register the task by the taskName.  
      
    
*   task(taskName:`string`, fn:`Undertaker.TaskFunction`): `void`
*   Register the task by the name property of the function.  
      
    
*   task(fn:`Undertaker.TaskFunction`): `void`

  
  

#### tree

*   Optionally takes an object (options) and returns an object representing the tree of registered tasks.  
      
    
*   tree(options?:`Undertaker.TreeOptions`): `Undertaker.TreeResult`