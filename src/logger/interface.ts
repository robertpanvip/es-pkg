export type LoggerOpt = {
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
    // Whether to turn off colors on the output.
    display?: string
    //How you want the path of the chunk to show.
    showChange?: boolean
}

export interface Specification {
    dirname?: string | undefined;
    prefix?: string | undefined;
    basename?: string | undefined;
    suffix?: string | undefined;
    extname?: string | undefined;
}