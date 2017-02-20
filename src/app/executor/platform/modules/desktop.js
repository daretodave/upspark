let comms = require('comms');

let Desktop = module.exports = {};

Desktop.beep = function() {
    return comms.message('DESKTOP.BEEP');
};

Desktop.openLocation = function(location) {
    return comms.message('DESKTOP.openLocation', location);
};

Desktop.moveItemToTrash = function(location) {
    return comms.message('DESKTOP.moveItemToTrash', location);
};

Desktop.open = function(location) {
    return comms.message('DESKTOP.open', location);
};

Desktop.openURI = function(location) {
    return comms.message('DESKTOP.openURI', location);
};
