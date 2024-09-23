import defineConfig from "@es-pkg/config";

export default defineConfig({
    es:'src',
    entry:'./src/index.ts',
    removeCompiled:false,
    "doc":{
        entry:'./src/index.ts',
    }
})