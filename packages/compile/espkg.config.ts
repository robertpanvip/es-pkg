import defineConfig from "@es-pkg/config";

export default defineConfig({
    es:'./src',
    entry:'./src/index.ts',
    doc:{
        entry:'./src/index.ts',
    }
})