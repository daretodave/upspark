const comms = require('comms');

Net = module.exports = {};

Net.get  = (url = null, options = null) => comms.message(
    'NET.get', {
        url, options
    }
);