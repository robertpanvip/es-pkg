import defineConfig from "@es-pkg/config";

export default defineConfig({
    es:'./npm/esm',
    entry:'./src/index.ts',
    doc:{
        entry:'./src/index.ts',
    }
})