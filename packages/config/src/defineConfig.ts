import type {DocOptions} from '@es-pkg/doc'

/**
 * EsPkg配置
 */
export interface EsPkgConfig {
    /** cjs 目录 @default 默认为./npm/cjs */
    cjs?: string,
    /** es 目录 @default 默认为./npm/es */
    es?: string,
    /** iife 目录 @default 默认为./npm/dist */
    iife?: string,
    /** 包含的文件 @default 默认为./src */
    include?: string[],
    /** 声明 目录 @default 默认为./typings */
    typings?: string,
    /** 入口 如果没有会尝试解析package.json的main字段 @default 默认为./src/index.ts */
    entry?: string,
    css?: {
        /** 额外包含的css文件 @default默认为[] */
        extra?:string[],
        /** autoprefixer  browserslist @default 默认为['last 2 versions'] */
        browserslist?: string[],
        /**输出配置：提取为单独的 CSS 文件（推荐） 可选：不提取，嵌入到 JS 中（通过 import 会生成 style 标签） @default 默认为${name}.min.css */
        extract?:boolean | string
    }
    publishAccess?: [string, string],
    /** 发布仓库 默认https://registry.npmjs.org**/
    publishRegistry?: string
    /** npm发布目录 @default 默认为 npm */
    publishDir?: string,
    /** md文档名称 @default 默认为 README */
    doc?: string | Partial<DocOptions>,
}

/**
 * 配置自定义
 */
export const defineConfig = (config: EsPkgConfig) => {
    return config
}