const comms = require('comms');

Net = module.exports = {};

Net.get  = (url = null, qs = null, headers = null) => comms.message(
    'NET.get', {
        url, qs, headers
    }
);

Net.post  = (url = null, form = null, headers = null) => comms.message(
    'NET.post', {
        url, form, headers
    }
);

Net.request  = (options = null) => comms.message(
    'NET.request', options
);