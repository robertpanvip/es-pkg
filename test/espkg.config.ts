import defineConfig from "es-pkg";
import alias from '@rollup/plugin-alias'

export default defineConfig({
    "es": "./npm/esm",
    "cjs": "./npm/cjs",
    "typings": "./src/index.ts",
    "publishDir": "./npm",
    "include": ["./src/"],
    "css": {
        "extra": [],
        extract: false,
    },
    rollupOptions: {
        external: (id, d) => {
            if (id.includes('react')) {
                return false
            }
            return d(id)
        },
        plugins: (d) => {
            return [
                alias({
                    entries: [
                        {find: 'react', replacement: 'vite'},
                    ],
                }),
                ...d
            ]
        }
    }
})