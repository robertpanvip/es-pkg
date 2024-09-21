import defineConfig from "@es-pkg/config";

export default defineConfig({
    es: "./bin",
    cjs: "./src",
    typings: './src/defineConfig.ts',
    entry: './src/index.ts',
    removeCompiled: false,
    doc: {
        entry: './src/defineConfig.ts',
    }
})