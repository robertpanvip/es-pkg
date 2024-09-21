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
declare module "rename" {
    export = rename;

    function rename(filepath: string | rename.FileObject, transformer: rename.Transformer): rename.FilePath;

    namespace rename {
        interface FileObject {
            // using package's terminology
            dirname?: string | undefined;
            basename?: string | undefined;
            extname?: string | undefined;
            path?: string | undefined;
            hash?: string | undefined; // not populated by package
            origin?: string | undefined;
        }

        interface Specification {
            dirname?: string | undefined;
            prefix?: string | undefined;
            basename?: string | undefined;
            suffix?: string | undefined;
            extname?: string | undefined;
        }

        type FilePath =
            | string
            | Specification;

        type Transformer =
            | ((spec: FileObject) => FilePath)
            | FilePath;

        interface ParsedFileObject {
            dirname: string;
            extname: string;
            basename: string;
            origin: string;
        }

        function parse(filename: string | Partial<ParsedFileObject>): ParsedFileObject;

        function stringify(obj: FileObject): string;
    }
}