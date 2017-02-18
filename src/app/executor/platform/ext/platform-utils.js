let upspark = {};

upspark.init = Date.now();
upspark.util = {};

upspark.util.parameters = function (func) {
    let source = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    return source.slice(source.indexOf('(') + 1, source.indexOf(')')).match(/([^\s,]+)/g) || [];
};
upspark.util.isUndefined = function (argument) {
    return typeof argument === 'undefined';
};
upspark.util.isNull = function (argument) {
    return argument === null;
};
upspark.util.isNullOrUndefined = function (argument) {
    return arguments.length === 0 || upspark.util.isUndefined(argument) || upspark.util.isNull(argument);
};
upspark.util.isNumber = function (argument) {
    return Number.isNumber(argument);
};
upspark.util.isBoolean = function (argument, checkIfEquals) {
    let passTest = typeof argument === 'boolean';
    if (passTest && arguments.length > 1) {
        return argument === check;
    }
    return passTest;
};
upspark.util.isString = function (argument) {
    return typeof argument === 'string';
};
upspark.util.camelize = function (str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) {
            return "";
        }
        return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
};
upspark.util.normalize = function (str) {
    return upspark.util.camelize(str.trim().replace(new RegExp('\_|\-', 'g'), ' '));
};
upspark.util.displayize = function (str) {
    str = upspark.util.normalize(str);
    return str.replace(/^[a-z]|[A-Z]/g, word => word.toUpperCase());
};

upspark.util.isArray = function (argument, atLength) {
    if (typeof argument === 'undefined' || argument === null) {
        return false;
    }
    return Object.prototype.toString.call(argument) === '[object Array]' ?
        (arguments.length === 1 ?
            true : (atLength < 0 ?
                argument.length >= Math.abs(atLength) : arguments.length === atLength)) : false;
};
upspark.util.deepMap = function (argument, mappingAction, flatten) {
    let resolve = [];
    Array.from(argument).forEach((arg) => {
        if (upspark.util.isArray(arg)) {
            resolve.push(upspark.util.deepMap(arg, mappingAction));
        } else {
            resolve.push(mappingAction(arg));
        }
    });
    if (flatten) {
        resolve = resolve.reduce(function (a, b) {
            return a.concat(b);
        }, []);
    }
    return resolve;
};
upspark.util.isFunction = function (argument) {
    return typeof argument === 'function';
};
upspark.util.isPrimitive = (function (primitives) {
    return function (argument, ignoreFunctions) {
        return argument === null
            || !ignoreFunctions && typeof argument === 'function'
            || primitives.indexOf(typeof argument) !== -1;
    };
})(["boolean", "number", "string", "symbol", "undefined"]);
upspark.util.resolve = function (id, entity, parameters, callback, errCallback, depth) {
    try {
        depth = depth ? depth + 1 : 0;

        if (upspark.util.isFunction(entity)) {

            entity = entity.apply({

                depth: depth,
                start: upspark.init,
                id: id,

                abort: function (message, nonError) {
                    if (arguments.length > 0) {
                        if (nonError) {
                            process.send({
                                intent: 'result',
                                payload: message
                            })
                        } else {
                            process.send({
                                intent: 'error',
                                payload: message
                            })
                        }
                    }

                    process.exit();
                },

                message: function (type, message) {
                    if (arguments.length < 2) {
                        message = type;
                        type = 'out';
                    }

                    process.send({
                        intent: type,
                        payload: message
                    })
                },

                log: (message, error) => process.send({
                    intent: error ? 'log-error' : 'log',
                    payload: message
                }),

                complete: (message) => process.send({
                    intent: 'result',
                    payload: message
                }),

                error: (message) => process.send({
                    intent: 'error',
                    payload: message
                }),

                progress: function (progress, message) {
                    if (arguments.length > 1) {
                        progress = {
                            progress: progress,
                            message: message
                        }
                    }

                    process.send({
                        intent: 'progress',
                        payload: progress
                    });
                },

            }, parameters);


            if (depth === 0 && typeof entity === 'undefined') {
                //user is handling their own process
                return;
            }

            upspark['util'].resolve(id, entity, parameters, callback, errCallback, depth);
            return;
        }

        if (!(entity instanceof Promise) && !upspark.util.isArray(entity)) {
            callback(entity);
            return;
        }

        Promise
            .all(upspark.util.isArray(entity) ? entity : [entity])
            .then(function (results) {
                let tree = {};
                let count = 0;

                let handler = function (result) {

                    tree[results.indexOf(result)] = result;
                    count += 1;

                    if (count === results.length) {
                        let leafs = Object.values(tree);

                        if (leafs.length === 0) {
                            callback(null);
                        } else if (leafs.length === 1) {

                            callback(leafs[0]);
                        } else {
                            callback(upspark.util.inspect(leafs, {
                                depth: null,
                                showHidden: true
                            }));
                        }
                    }
                };

                results.forEach(function (result) {

                    upspark.util.resolve(id, result, parameters, handler, handler, depth);
                });
            })
            .catch(err => {
                errCallback(err);
            });
    } catch (err) {
        errCallback(err.message);
    }


};