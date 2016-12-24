let upspark = upspark || {};

upspark.util = {};
upspark.util.parameters = function(func) {
    let source = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    return source.slice(source.indexOf('(')+1, source.indexOf(')')).match(/([^\s,]+)/g) || [];
};
upspark.util.isUndefined = function(argument) {
    return typeof argument === 'undefined';
};
upspark.util.isNull = function(argument) {
    return argument === null;
};
upspark.util.isNullOrUndefined = function(argument) {
    return arguments.length === 0 || upspark.util.isUndefined(argument) || upspark.util.isNull(argument);
};
upspark.util.isString = function(argument) {
    return typeof argument === 'string';
};
upspark.util.isArray = function(argument, atLength) {
    return Array.isArray(argument) ?
        (arguments.length === 1 ?
            true : (atLength < 0 ?
                argument.length >= Math.abs(atLength) : arguments.length === atLength)) : false;
};
upspark.util.isFunction = (function(sample) {
    return function(argument) {
        return sample.toString.call(argument) === '[object Function]';
    };
})({});
upspark.util.isPrimitive = (function(primitives) {
    return function(argument, ignoreFunctions) {
        return argument === null
            || !ignoreFunctions && typeof argument === 'function'
            || primitives.indexOf(typeof argument) !== -1;
    };
})(["boolean", "number", "string", "symbol", "undefined"]);