import defineConfig from "es-pkg";

export default defineConfig({
    "es": "./npm/esm",
    "cjs": "./npm/cjs",
    "typings": "./src/index.ts",
    "publishDir": "./npm",
    "include": ["./src/"],
    "css": {
        "extra": [],
        extract: false,
    }
})