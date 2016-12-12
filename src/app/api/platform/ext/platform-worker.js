(function(title, input) {
    if(arguments.length === 0) {
        upspark['__internal'].fatal('no command to execute');
        return;
    }
    if(!upspark['util'].isString(title)) {
        upspark['__internal'].log(`command name was not a string | defaulting to name.toString`);
        title = title.toString();
    }

    let log = function(message) {
        upspark['__internal'].log(`${message}`);
    };

    log('executing');

    let command = upspark['__internal'].commands[title],
        parameters = [];
    if (!command) {
        upspark['__internal'].fatal(`The command '${title}' was not found`);
        return;
    }

    if(input) {
        if(!upspark['util'].isString(input)) {
            input = input.toString();
            log('input provided was not string | defaulting to input.toString');
        }
        parameters = input.split(command.split);

        log(`[${parameters.join(", ")}]`);
    }

    upspark['__internal']
    .resolve(command.processor, parameters, function(result) {
        process.send({
            type: 'command-result',
            response: result
        });
    }, function(error) {
        process.send({
            type: 'command-result',
            error: true,
            response: error
        });
    });

})(process.argv[2], process.argv[3]);
