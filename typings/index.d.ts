/// <reference types="node" />

declare module "gulp-babel" {
    function babel(options?: {
        filename?: string | undefined,
        filenameRelative?: string | undefined,
        presets?: string[] | (string | object)[][] | undefined,
        plugins?: string[] | undefined,
        highlightCode?: boolean | undefined,
        only?: string | string[] | undefined,
        ignore?: string | string[] | undefined,
        auxiliaryCommentBefore?: any,
        auxiliaryCommentAfter?: any,
        sourceMaps?: any,
        inputSourceMap?: any,
        sourceMapTarget?: any,
        sourceFileName?: any,
        sourceRoot?: any,
        moduleRoot?: any,
        moduleIds?: any,
        moduleId?: any,
        getModuleId?: any,
        resolveModuleSource?: any,
        keepModuleIdExtesions?: boolean | undefined,
        code?: boolean | undefined,
        ast?: boolean | undefined,
        compact?: any,
        comments?: boolean | undefined,
        shouldPrintComment?: any,
        env?: any,
        retainLines?: boolean | undefined
    }): NodeJS.ReadWriteStream;

    export default babel
}

declare module "gulp-logger" {
    type Props = {
        before?: string
        //The message you want to show before the chunks are shown.
        after?: string
        //The message you want to show after the chunks are shown.
        beforeEach?: string
        //The message you want to show before each chunk.
        afterEach?: string
        //The message you want to show after each chunk.
        prefix?: string
        //A constant value to prefix to each filename in the chunk.
        suffix?: string
        //A constant value to suffix to each filename in the chunk.
        extname?: string
        //A constant value to set as the extension for each filename in the chunk.
        basename?: string
        // A constant value to set as the basename for each filename in the chunk.
        dest?: string
        //A constant value to set as the dest for each filename in the chunk.
        colors?: boolean
        //Whether or not to turn off colors on the output.
        display?: string
        //How you want the path of the chunk to show.
        showChange?: boolean
    }
    const res: (props: Props) => NodeJS.ReadWriteStream;
    export default res
}
declare module "*.json" {
    const json: Object;
    export default json
}
