let comms = require('comms');

let Runner = module.exports = {};

Runner.getTasks = function() {
    return comms.message('RUNNER.GETTASKS');
};
Runner.abort = function(id) {
    return comms.message('RUNNER.ABORT', id);
};
Runner.run = function(command, ...args) {
    return comms.message('RUNNER.RUN', {
        command:command,
        args:args
    });
};