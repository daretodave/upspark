let PlatformCommand = {
    command: undefined,
    context: undefined,

    callbacks: {
        when: [],
        then: [],

    },

    processors: function () {
        return this.command;
    },

    arguments: [],

    when: function (callback) {
        if(!callback) {
            return;
        }
        if(callback) {

        }
    }
};
let PlatformCommandArgument = {

};
let PlatformProcessor = {

};