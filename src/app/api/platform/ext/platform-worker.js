(function(title, input) {

    if(!title) {
        throw Error('No command to execute');
    }

    var command = commands[title];
    if (!command) {
        throw Error(`The command '${title}' was not found`);
    }

    var parameters = [];
    if(input) {
        parameters = input.split(command.split);
    }

    upspark.__log('executing ' + title);

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
