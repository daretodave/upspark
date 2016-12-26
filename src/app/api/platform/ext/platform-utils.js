let upspark = {};

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
upspark.util.isNumber = function(argument) {
    return Number.isNumber(argument);
};
upspark.util.isBoolean = function(argument, checkIfEquals) {
    let passTest = typeof argument === 'boolean';
    if (passTest && arguments.length > 1) {
        return argument === checkIfEquals;
    }
    return passTest;
};
upspark.util.isString = function(argument) {
    return typeof argument === 'string';
};
upspark.util.camelize = function(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) {
            return "";
        }
        return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
};
upspark.util.normalize = function(str) {
    return upspark.util.camelize(str.trim().replace(new RegExp('\_|\-', 'g'), ' '));
};
upspark.util.displayize = function(str) {
    str = upspark.util.normalize(str);
    return str.replace(/^[a-z]|[A-Z]/g, word => word.toUpperCase());
};

upspark.util.isArray = function(argument, atLength) {
    return Array.isArray(argument) ?
        (arguments.length === 1 ?
            true : (atLength < 0 ?
                argument.length >= Math.abs(atLength) : arguments.length === atLength)) : false;
};
upspark.util.deepMap = function(argument, mappingAction, flatten) {
    let resolve = [];
    Array.from(argument).forEach((arg) => {
        if(upspark.util.isArray(arg)) {
            resolve.push(upspark.util.deepMap(arg, mappingAction));
        } else {
            resolve.push(mappingAction(arg));
        }
    });
    if(flatten) {
        resolve = resolve.reduce(function(a, b) {
            return a.concat(b);
        }, []);
    }
    return resolve;
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
upspark.util.resolve = function(entity, parameters, callback, errCallback, depth) {
    depth = depth ? depth+1 : 0;

    if(upspark.util.isPrimitive(entity, true) || (upspark.util.isArray(entity, 0))) {
        callback(entity);
        return;
    }
    if(upspark.util.isFunction(entity)) {
        entity = entity.apply(upspark, parameters);

        upspark['__internal'].resolve(entity, parameters, callback, errCallback, depth);
        return;
    }

    Promise
        .all(upspark.util.isArray(entity) ? entity : [entity])
        .then(function(results) {
            let tree = {};
            let count = 0;

            let handler = function(result) {
                tree[results.indexOf(result)] = result;
                count += 1;

                if(count === results.length) {
                    let leafs = Object.values(tree);
                    if(leafs.length === 0) {
                        callback(null);
                    } else if (leafs.length === 1) {
                        callback(leafs[0]);
                    } else {
                        callback(upspark.util.inspect(leafs, {

                        }));
                    }
                }
            };

            results.forEach(function(result) {
                upspark['__internal'].resolve(result, parameters, handler, handler, depth);
            });
        })
        .catch(errCallback);
};