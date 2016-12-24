let upspark = upspark || {};

upspark['__internal'] = {};
upspark['__internal'].commands = {};
upspark['__internal'].loaded = false;
upspark['__internal'].worker = false;
upspark['__internal'].context = 'INIT';
upspark['__internal'].modules = [];
upspark['__internal'].fatal = function(error) {
  let message = error || 'There was a fatal error during execution.';
  if (message.hasOwnProperty('message')) {
      message = message['message'];
  }
  if(upspark['__internal'].context) {
      message = `${upspark['__internal'].context} | ${error}`;
  }
  throw message;
};
upspark['__internal'].require = function(path) {
    if(!upspark['__internal'].modules.includes(path)) {
        upspark['__internal'].fatal(`Could not find module ${path}`);
    }
    return require(path);
};
upspark['__internal'].onContextSwitch = function(context) {
    upspark['__internal'].context = context;
};
upspark['__internal'].log = function(message, error) {
    if(!process.send) {
        __log(message, error);
        return;
    }

    process.send({
        type: 'command-log',
        logType: error ? 'log-error' : 'log-info',
        internal: true,
        message: message,
        error: error
    });
};
upspark['__internal'].error = function (message) {
    return upspark['__internal'].log(message, true);
};
upspark['__internal'].resolve = function(entity, parameters, callback, errCallback, depth) {
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

upspark.on = upspark.command = function(argument, processor, options) {
    if(upspark.util.isNullOrUndefined(argument)) {
        upspark['__internal'].fatal(`Can not assign a command to a null or undefined argument`);
    }

    let log = function(message) {
        if(upspark['__internal'].worker) {
            return;
        }
        upspark['__internal'].log(`upspark.on | ${message}`);
    };

    if(!upspark.util.isString(argument)) {
        argument = argument.toString();

        log(`provided argument was not a string. defaulting to argument.toString`);
    }
    argument = argument.trim();

    log(`mapping '${argument}'`);

    let parameters = false;
    if(upspark.util.isFunction(processor)) {
        parameters = upspark.util.parameters(processor);
    }

    log(`mapped  '${argument}' ${parameters ? ('to a function' + (parameters.length ? '(' + parameters.join(", ") + ')': '')) : 'as ' + processor}`);

    upspark['__internal'].commands[argument] = {
        processor: processor,
        split: split,
        context: upspark['__internal'].context
    };
};
