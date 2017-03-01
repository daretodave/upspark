const comms = require('comms');

File = module.exports = {};

File.access = (path, mode = null) => comms.message(
    'FILE.access', {
        path, mode
    }
);

File.stat = (path) => comms.message(
    'FILE.stat', {
        path
    }
);

File.chmod = (path, mode = null) => comms.message(
    'FILE.chmod', {
        path,
        mode
    }
);

File.chown = (path, uid = null, gid = null) => comms.message(
    'FILE.chmod', {
        path,
        uid,
        gid
    }
);

File.write = (path, contents, options) => comms.message(
    'FILE.write', {
        path, contents, options
    }
);

File.append = (path, contents, options) => comms.message(
    'FILE.append', {
        path, contents, options
    }
);

File.read = (path, options) => comms.message(
    'FILE.read', {
        path, options
    }
);

File.readJSON = (path, options) => comms.message(
    'FILE.readJSON', {
        path, options
    }
);

File.writeJSON = (path, contents, options) => comms.message(
    'FILE.writeJSON', {
        path, contents, options
    }
);

File.list = (path) => comms.message(
    'FILE.list', {
        path
    }
);

File.createPath = (path) => comms.message(
    'FILE.createPath', {
        path
    }
);

File.resolve = (...path) => comms.message(
    'FILE.resolve', {
        path: [...path]
    }
);

File.createFile = (path, contents, options) => comms.message(
    'FILE.createFile', {
        path, contents, options
    }
);

File.remove = (path) => comms.message(
    'FILE.remove', {
        path
    }
);

File.move = (src, dst) => comms.message(
    'FILE.move', {
        src,
        dst
    }
);

File.copy = (src, dst) => comms.message(
    'FILE.copy', {
        src,
        dst
    }
);

File.rename = (path, name) => comms.message(
    'FILE.rename', {
        target: path,
        name
    }
);