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
upspark['__internal'].resolve = upspark.util.resolve.bind;

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
        parameters = upspark.util.parameters(processor).map((name) => {
            let argument = Object.create(PlatformCommand);
            argument.name = name;

            return argument;
        });
    }

    log(`mapped  '${argument}' ${parameters ? ('to a function' + (parameters.length ? '(' + parameters.join(", ") + ')': '')) : 'as ' + processor}`);

    upspark['__internal'].commands[argument] = {
        processor: processor,
        split: split,
        context: upspark['__internal'].context
    };
};
