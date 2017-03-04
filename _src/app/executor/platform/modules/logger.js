let Logger = module.exports = {};

Logger.info = function (message) {
    process.send({
        intent: 'log-internal',
        payload: message
    })
};

Logger.error = function (message) {
    process.send({
        intent: 'log-internal-error',
        payload: message
    })
};