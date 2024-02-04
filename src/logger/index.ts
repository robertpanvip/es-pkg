import through from "through2"
import utils from "./utils"
import processFilePath from "./process-file-path"
import processFunction from "./process-function"
import type {LoggerOpt} from "./interface";
import log from "./log"

const colorTrans = utils.colorTrans;
const GulpLogger = function(fnOpts:LoggerOpt, opts:LoggerOpt = {} as LoggerOpt) {
    let options:LoggerOpt = typeof fnOpts === 'object' ? fnOpts : opts,
        beforeComplete = false,
        afterComplete = false;

    if (options) {
        utils.colorsEnabled = typeof options.colors !== 'undefined' ? options.colors : true;
    }

    function loggerEndHandler(flushCallback:() => void) {
        if (options && options.after && !afterComplete) {
            log(colorTrans(options.after, 'cyan'));
            afterComplete = true;
        }

        flushCallback();
    }

    return through.obj(function(file, ext, streamCallback) {
        let filePath = file.path;

        if (options && options.before && !beforeComplete) {
            log(colorTrans(options.before, 'cyan'));
            beforeComplete = true;
        }

        if (typeof fnOpts === 'function') {
            processFunction(filePath, fnOpts, opts);
        } else if (typeof fnOpts === 'object') {
            processFilePath(filePath, fnOpts);
        } else {
            log(utils.getRelativePath(filePath));
        }

        streamCallback(null, file);
    }, loggerEndHandler);
};
export default GulpLogger
