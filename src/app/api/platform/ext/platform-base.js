var inspect = require('util').inspect;
var commands = {};
var upspark = this;
var commandContext = '...';
var internalNodeModules = [];

upspark.contextShift = function(newContext) {
    commandContext = newContext;
};

upspark.requireInternalNodeModule = function(path) {
    if(!internalNodeModules.includes(path)) {
        throw `Could not find module ${path}`;
    }
    return require(path);
};

upspark.__log = function(message, error) {
    process.send({
        type: 'command-log',
        logType: error ? 'log-error' : 'log-info',
        internal: true,
        message: message,
        error: error
    });
    return upspark;
};

upspark.__error = function (message) {
    return upspark.__log(message, true);
};

upspark.on = function(argument, split, processor) {
    if(!argument) {
        return;
    }

    if(arguments.length === 1) {
        processor = argument;
        split = "|";
    } else if(arguments.length === 2) {
        processor = split;
        split = "|";
    }

    commands[argument.trim()] = {
        processor: processor,
        split: split,
        context: commandContext
    };
}

function isFunction(functionToCheck) {
    var __dummyFn = {};
    return functionToCheck && __dummyFn.toString.call(functionToCheck) === '[object Function]';
}

function getResolution(entity, parameters, callback, errCallback) {
    console.log(entity);
    if(!entity) {
        return callback(null);
    }
    var type = typeof entity;
    if(type === "number" || type === "string" || type === "boolean") {
        callback(entity);
        return;
    }

    var resolve = Promise.resolve(entity);
    if (resolve === entity) {
        resolve
            .then(function() {
                var parameters = Array.from(arguments);
                if (parameters.length === 0) {
                   callback(null);
                } else if(parameters.length === 1) {
                    getResolution(parameters[0], parameters, callback, errCallback);
                }
            })
            .catch(errCallback);
        return;
    }
    if(isFunction(entity)) {
        getResolution(entity.apply(upspark, parameters), parameters, callback, errCallback);
        return;
    }

    callback(inspect(entity, {
        showHidden: false
    }));
}