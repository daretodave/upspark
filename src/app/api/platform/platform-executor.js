if(process.send && process.argv.length > 2) {
    (function(arg) {
        if(!arg) {
            throw Error('No command to execute');
        }

        process.send({
            type: 'log',
            message: arg,
            commands: commands
        });

        var title  = arg, input, parameters;
        var blocks = arg.split(":", 2);

        if(blocks.length > 1) {
            title = blocks[0];
            if (blocks[1].length) {
                input = blocks[1];
            }
        } else if(blocks.length === 1) {
            title = blocks[0];
        }

        if(!title) {
            throw Error('No command to execute');
        }

        var command = commands[title];
        if (!command) {
            throw Error(`The command '${title}' was not found`);
        }

        if(input) {
            parameters = input.split(command.split);
        }

        process.send({
            type: 'log',
            message: 'executing \'' + arg + '\''
        });

        getResolution(command.processor, parameters, function(result) {
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

    })(process.argv[2]);
}