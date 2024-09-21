import type {DocOptions} from '@es-pkg/doc'
import {pkg} from "./index";
import path from 'node:path'

const cwd = process.cwd();

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
    /** 声明 目录 @default 默认为./typings */
    typings?: string,
    /** 入口 @default 默认为./src */
    entry?: string,
    /** 发布前是否移除编译后的文件 */
    removeCompiled?: boolean,
    entryCss?: [],
    publishAccess?: [string, string]
    /** npm发布目录 @default 默认为../npm */
    publishDir?: string,
    /** md文档名称 @default 默认为 README */
    doc?: string | Partial<DocOptions>,
}

/**
 * 配置自定义
 */
export const defineConfig = (config: EsPkgConfig) => {
    if (typeof config.doc === 'string') {
        config.doc = {
            name: pkg.name,
            desc: pkg.desc,
            outName: config.doc,
            tsconfig: path.join(cwd, './tsconfig.json'),
        }
    }
    return config
}