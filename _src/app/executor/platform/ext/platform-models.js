upspark = upspark || {};

let PlatformCommand = {
    command: undefined,
    context: undefined,
    arguments: [],

    processor: function () {
        return this.command;
    },

};
let PlatformCommandArgument = {

    properties: {
        name: {
            original: undefined,
            normalized: undefined,
            display: undefined
        },
        multiline: false
    },

    setName(name, nameFriendly, nameNormalized) {
        this.properties.name.original = name;
        this.properties.name.display = arguments.length > 1 ? nameFriendly : upspark.util.displayize(name);
        this.properties.name.normalized = arguments.length > 2 ? nameNormalized : upspark.util.normalize(name);
        return this;
    },

    getName(normalized) {
        return this.properties.name[!!normalized ? 'normalized' : 'display'];
    },

    getOriginalName() {
        return this.properties.name.display;
    },

    setNormalizedName(nameNormalized) {
        this.properties.name.normalized = arguments.length ? nameNormalized : upspark.util.normalize(name);
        return this;
    },

    setDisplayName(nameDisplay) {
        this.properties.name.display = arguments.length ? nameDisplay : upspark.util.displayize(name);
        return this;
    },

    multiline: false,

};
let PlatformProcessor = {
    parameters: [],
    param(argument) {
        if (!this.parameters.length || upspark.util.isNullOrUndefined(argument)) {
            return undefined;
        }
        if (arguments.length === 0) {
            return this.parameters[0];
        }
        if (upspark.util.isNumber(argument)) {
            if (argument < 0 || argument > this.parameters.length - 1) {
                return undefined;
            }
            return this.parameters[argument];
        }
        this.parameters.find((title))
    },
    __isPlatformProcessor: true,
    executor() {
    }
};

PlatformProcessor.from = function (argument) {
    if (typeof argument !== 'undefined'
        && argument.hasOwnProperty('__isPlatformProcessor')) {
        return argument;
    }

    let processor = Object.create(PlatformProcessor);

    if (typeof argument === 'undefined') {
        return processor;
    }

    if (upspark.util.isFunction(argument)) {
        processor.parameters = upspark.util.parameters(argument).map((name) => {
            let platformCommandArgument = Object.create(PlatformCommandArgument);

            platformCommandArgument.setName(name);

            return platformCommandArgument;
        });
        processor.executor = argument;
        return processor;
    }

    if (upspark.util.isArray(argument)) {
        upspark.util.deepMap(argument, PlatformProcessor.from, true);
    }

    processor.executor = function () {
        return argument;
    };

    return processor;
};