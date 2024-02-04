export type EsPkgConfig = {
    /** lib 目录 @default 默认为./lib */
    lib?: string,
    /** es 目录 @default 默认为./es */
    es?: string,
    /** dist 目录 @default 默认为./dist */
    dist?: string,
    /** src 目录 @default 默认为./src */
    src?: string,
    /** 声明 目录 @default 默认为./typings */
    typings?: string,
    /** 入口 @default 默认为./src/index.tsx */
    entry?: string,
    entryCss?: [],
    /** npm发布目录 @default 默认为../${pkg.name}-npm */
    publishDir?: string,
    /** md文档名称 @default 默认为 README */
    doc?: string,
}
export const defineConfig = (config: EsPkgConfig) => {
    return config
}