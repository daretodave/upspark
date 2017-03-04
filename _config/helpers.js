const path   = require('path');
const __root = path.resolve(__dirname, '../');


export default class Helpers {

    static path() {
        let args = Array.prototype.slice.call(arguments, 0);
        return path.join.apply(path, [__root].concat(args));
    }

    static imported(src) {
        return `require('${src}')`;
    }

}