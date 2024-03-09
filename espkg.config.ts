import {defineConfig} from "./src/defineConfig";

export default defineConfig({
    "es": "./bin",
    "lib": "./src",
    "typings":'./src/defineConfig.ts',
    "entry":'./src/es-pkg.ts',
    "doc":{
        entry:'./src/defineConfig.ts',
    }
})