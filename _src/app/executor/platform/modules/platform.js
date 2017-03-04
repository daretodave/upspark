let comms = require('comms');

let Platform = module.exports = {};

Platform.ALL = 0;
Platform.SCRIPTS = 1;
Platform.SETTINGS = 2;
Platform.THEME = 4;

Platform.reload = function(mode) {
    if(arguments.length === 0) {
        mode = '0';
    }

    return comms.message('PLATFORM.RELOAD', mode);
};

Platform.getPath = function() {
    return comms.message('PLATFORM.GETPATH');
};

Platform.getPlatformCommands = function() {
    return comms.message('PLATFORM.GETPLATFORMCOMMANDS');
};
Platform.getInternalCommands = function() {
    return comms.message('PLATFORM.GETINTERNALCOMMANDS');
};
Platform.getCommands = function() {
    return comms.message('PLATFORM.GETCOMMANDS');
};