let comms = require('comms');

let Safe = module.exports = {};

Safe.get = function (key) {
    return comms.message('SAFE.GET', key);
};