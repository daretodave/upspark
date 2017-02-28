const comms = require('comms');

File = module.exports = {};

File.write = (path, contents) => comms.message(
    'FILE.write', {
        path, contents
    }
);