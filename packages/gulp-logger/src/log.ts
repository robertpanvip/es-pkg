import util from 'util';
import {Console} from 'console';
import supportsColor from 'color-support';

const console = new Console({
    stdout: process.stdout,
    stderr: process.stderr,
    colorMode: false,
});

function hasFlag(flag: string) {
    return process.argv.indexOf('--' + flag) !== -1;
}

function hasColors() {
    if (hasFlag('no-color')) {
        return false;
    }

    if (hasFlag('color')) {
        return true;
    }

    return !!supportsColor();
}

class Timestamp {
    now: Date;

    constructor() {
        this.now = new Date();
    }

    [util.inspect.custom] = (depth: number, opts: { stylize: (timestamp: string, data: string) => string }) => {
        const timestamp = this.now.toLocaleTimeString('en', {hour12: false});
        return '[' + opts.stylize(timestamp, 'date') + ']';
    }
}

function getTimestamp() {
    return util.inspect(new Timestamp(), {colors: hasColors()});
}

class Log {
    constructor(...args: Parameters<typeof console.log>) {
        return this.log(args)
    }

    log(...args: Parameters<typeof console.log>) {
        let time = getTimestamp();
        process.stdout.write(time + ' ');
        console.log.apply(console, args);
        return this;
    }

    info(...args: Parameters<typeof console.info>) {
        let time = getTimestamp();
        process.stdout.write(time + ' ');
        console.info.apply(console, args);
        return this;
    }

    dir(...args: Parameters<typeof console.dir>) {
        let time = getTimestamp();
        process.stdout.write(time + ' ');
        console.dir.apply(console, args);
        return this;
    }

    warn(...args: Parameters<typeof console.warn>) {
        let time = getTimestamp();
        process.stderr.write(time + ' ');
        console.warn.apply(console, args);
        return this;
    }

    error(...args: Parameters<typeof console.error>) {
        let time = getTimestamp();
        process.stderr.write(time + ' ');
        console.error.apply(console, args);
        return this;
    }
}

export default new Log().log;