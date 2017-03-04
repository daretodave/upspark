let comms = require('comms');

let Safe = module.exports = {};

Safe.isUnlocked = function() {
  return comms.message('SAFE.ISUNLOCKED');
};

Safe.lock = function() {
    return comms.message('SAFE.LOCK');
};

Safe.unlock = function(password) {
    return comms.message('SAFE.UNLOCK', password);
};

Safe.get = function (key, ifNotFound) {
    let promise = comms.message('SAFE.GET', key);

    if(arguments.length > 1) {
        return new Promise(resolve => {

            promise.then(resolve).catch(() => {
               resolve(ifNotFound);
            });

        });
    }

    return promise;
};