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
declare module "single-line-log" {
    export const stdout: (txt: string) => void;
}
declare module "memorystream" {
    class MemoryStream implements NodeJS.ReadWriteStream {
        readable: boolean
        read(size?: number | undefined): string | Buffer
        setEncoding(encoding: BufferEncoding): this
        pause(): this
        resume(): this
        isPaused(): boolean
        pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean | undefined } | undefined): T
        unpipe(destination?: NodeJS.WritableStream | undefined): this
        unshift(chunk: string | Uint8Array, encoding?: BufferEncoding | undefined): void
        wrap(oldStream: NodeJS.ReadableStream): this
        [Symbol.asyncIterator](): AsyncIterableIterator<string | Buffer>
        addListener(eventName: string | symbol, listener: (...args: any[]) => void): this
        on(eventName: string | symbol, listener: (...args: any[]) => void): this
        once(eventName: string | symbol, listener: (...args: any[]) => void): this
        removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this
        off(eventName: string | symbol, listener: (...args: any[]) => void): this
        removeAllListeners(event?: string | symbol | undefined): this
        setMaxListeners(n: number): this
        getMaxListeners(): number
        listeners(eventName: string | symbol): Function[]
        rawListeners(eventName: string | symbol): Function[]
        emit(eventName: string | symbol, ...args: any[]): boolean
        listenerCount(eventName: string | symbol): number
        prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this
        prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this
        eventNames(): (string | symbol)[]
        writable: boolean
        write(buffer: string | Uint8Array, cb?: ((err?: Error | null | undefined) => void) | undefined): boolean
        write(str: string, encoding?: BufferEncoding | undefined, cb?: ((err?: Error | null | undefined) => void) | undefined): boolean
        write(buffer: any, cb?: ((err?: Error | null | undefined) => void) | undefined): boolean
        end(cb?: (() => void) | undefined): this
        end(data: string | Uint8Array, cb?: (() => void) | undefined): this
        end(str: string, encoding?: BufferEncoding | undefined, cb?: (() => void) | undefined): this
    }
    export default MemoryStream;
}

declare module "fetch"{
    export const fetchUrl: (url:string, options:(error:Error,meta:{finalUrl:string,})=>void, callback?:Function) => void;
}
declare module "*.json" {
    const json: Object;
    export default json
}
