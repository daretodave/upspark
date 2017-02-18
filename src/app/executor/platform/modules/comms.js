let Comms = module.exports = {};

let processors = {};

process.on('message', (packet) => {
    if(!packet
        || !packet.hasOwnProperty("id")
        || !processors.hasOwnProperty(packet.id)) {
        return;
    }

    processors[packet.id](packet.message);
});

function getGUID() {

    function randomStringChunk() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return randomStringChunk() + randomStringChunk() + '-'
            + randomStringChunk() + '-'
            + randomStringChunk() + '-'
            + randomStringChunk() + '-'
            + randomStringChunk() + randomStringChunk() + randomStringChunk();
}

Comms.message = function (action, parameters) {
    return new Promise(function(resolve, reject) {

        let id = getGUID();

        processors[id] = (message) => {
            if(message.hasOwnProperty('payload')) {
                if(message.error) {
                    reject(message.payload);
                } else {
                    resolve(message.payload);
                }
            } else {
                resolve(message);
            }
        };

        process.send({
            intent: 'comms',
            payload: {
                id: id,
                action: action,
                parameters: parameters || ''
            }
        })

    });
};