import utils from "./utils";
import path from "path";
import rename from "rename";
import log from "./log";
import type {LoggerOpt, Specification} from "./interface";

const colorTrans = utils.colorTrans;
const getDisplayPath = utils.getDisplayPath;

export default function processFilePath(filePath: string, opts:LoggerOpt) {
    opts = opts || {};

    let display = opts.display || 'rel',
        beforeEach = opts.beforeEach,
        afterEach = opts.afterEach,
        prefix = opts.prefix,
        suffix = opts.suffix,
        extname = opts.extname,
        basename = opts.basename,
        dest = opts.dest,
        showChange = opts.showChange,
        renameConfig: Partial<Specification> = {},
        filePathToProcess: string | string[] = [],
        displayPath,
        destPath,
        oldBasename,
        newBasename;

    displayPath = getDisplayPath(filePath, display);
    destPath = dest ? colorTrans(path.resolve(path.sep + displayPath, dest) + path.sep, 'blue') : displayPath;
    filePathToProcess.push(colorTrans(destPath, 'gray'));

    oldBasename = path.basename(filePath);

    if (prefix) {
        renameConfig.prefix = colorTrans(prefix, 'magenta');
    }

    if (suffix) {
        renameConfig.suffix = colorTrans(suffix, 'magenta');
    }

    if (extname) {
        renameConfig.extname = colorTrans(extname, 'magenta');
    }

    if (basename) {
        renameConfig.basename = colorTrans(basename, 'magenta');
    }

    if (Object.keys(renameConfig).length) {
        newBasename = colorTrans(path.basename(rename(filePath, renameConfig) as string), 'gray');
    } else {
        newBasename = colorTrans(oldBasename, 'gray');
    }

    filePathToProcess.push(newBasename);

    filePathToProcess = filePathToProcess.join('');
    if (beforeEach) {
        filePathToProcess = colorTrans(beforeEach, 'yellow') + filePathToProcess;
    }

    if (afterEach) {
        filePathToProcess = filePathToProcess + colorTrans(afterEach, 'yellow');
    }

    if (showChange) {
        log(colorTrans(displayPath + "" + oldBasename, 'gray'), ' --> ', filePathToProcess);
    } else {
        log(filePathToProcess);
    }
}
