import path from 'path';
import chalk from 'chalk';
import type {Color} from 'chalk';

const Utils = {
    getRelativePath: function (filePath: string) {
        return path.relative(process.cwd(), filePath);
    },

    colorsEnabled: true,

    colorTrans: function (message:string, color: Color) {
        let result = message;

        if (Utils.colorsEnabled) {
            result = chalk[color](message);
        }

        return result;
    },

    getDisplayPath: function (filePath:string, display:string) {
        let newPath;

        switch (display) {
            case 'name':
                newPath = '';
                break;
            case 'abs':
                newPath = path.dirname(filePath) + path.sep;
                break;
            case 'rel':
            /* falls through */
            default:
                newPath = path.dirname(Utils.getRelativePath(filePath)) + path.sep;
                break;
        }

        return newPath;
    }
};
export default Utils;