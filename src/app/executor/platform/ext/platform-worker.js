(function(argv) {
    if(!Array.isArray(argv)) {
        argv = [0, 0, argv];
    }

    if(argv.length < 2) {
        upspark['__internal'].fatal('no command to execute');
        return;
    }

    let title = argv[2];
    let parameters = [];

    if(argv.length > 2) {
        for(let i = 3; i < argv.length; i++) {
            parameters.push(argv[i]);
        }
    }

    if(!upspark['util'].isString(title)) {
        upspark['__internal'].log(`command name was not a string | defaulting to name.toString`);
        title = title.toString();
    }

    let log = function(message) {
        upspark['__internal'].log(`${message}`);
    };

    let command = upspark['__internal'].commands[title];
    if (!command) {
        upspark['__internal'].fatal(`The command '${title}' was not found`);
        return;
    }

    if(parameters.length) {
        parameters.map(function (input, index) {
            if(!upspark['util'].isString(input)) {
                input = input.toString();

                log('input[' + index + '] not string | defaulting to input.toString');
            }
        });

        log(`[${parameters.join(", ")}]`);
    }

    upspark['util'].resolve(command.processor, parameters, function(result) {
        process.send({
            intent: 'result',
            payload: result
        });
    }, function(error) {
        process.send({
            intent: 'error',
            payload: error
        });
    });

})(process.argv);
