let comms = require('comms');

let Runner = module.exports = {};

Runner.getTasks = function() {
    return comms.message('RUNNER.GETTASKS');
};
Runner.abort = function(id) {
    return comms.message('RUNNER.ABORT', id);
};
Runner.setCWD = function(cwd) {
    return comms.message('RUNNER.SETCWD', cwd);
};
Runner.getCWD = function() {
    return comms.message('RUNNER.GETCWD');
};
Runner.setENV = function(key, value) {
    return comms.message('RUNNER.SETENV', {
        key: key,
        value: value
    });
};
Runner.getENV = function(key) {
    return comms.message('RUNNER.GETENV', key);
};
Runner.show = function() {
    return comms.message('RUNNER.SHOW');
};
Runner.isVisible = function() {
    return comms.message('RUNNER.ISVISIBLE');
};
Runner.hide = function() {
    return comms.message('RUNNER.HIDE');
};
Runner.toggle = function() {
    return comms.message('RUNNER.TOGGLE');
};
Runner.run = function(command, ...args) {
    return comms.message('RUNNER.RUN', {
        command:command,
        args:args
    });
};