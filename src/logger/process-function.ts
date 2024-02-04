import utils from "./utils"
import path from "path"
import type {LoggerOpt} from "./interface";

const getDisplayPath = utils.getDisplayPath;

export default function processFunction(filePath: string, fn: (filePath: string) => void, opts: LoggerOpt) {
    opts = opts || {};

    let display = opts.display || 'rel',
        newPath = getDisplayPath(filePath, display) + path.basename(filePath);

    fn(newPath);
}
