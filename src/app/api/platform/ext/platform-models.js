upspark = upspark || {};

let PredicatePolicy = (function (predicate) {

    predicate.NONE = -1;
    predicate.SOME = -2;
    predicate.EVERY = -3;

    return predicate;
})({});

let PlatformPredicateDigest = {

    predicates: [],
    mode: PredicatePolicy.SOME,

    results: {
        fails: 0,
        passes: 0,
        total: 0
    },
    callbacks: {
        resolve,
        reject
    },

    target: 0,
    negate: false,
    resolutions: [],
    resolved: false,

    onResult(isFail, attached) {
        if (this.resolved) {
            return;
        }

        if (!isFail) {
            this.resolutions.push(attached);
        }

        this.results.target++;
        this.results[isFail ? 'fails' : 'passes']++;

        if (this.mode === PredicatePolicy.NONE && !isFail) {
            this.callbacks.reject(attached);
            return;
        } else if (this.mode === PredicatePolicy.EVERY && isFail) {
            this.callbacks.reject(attached);
            return;

        }
        if (this.results.total === predicates.length
            ||  this.results[negate ? 'fails' : 'passes'] === this.results.target
            || (this.predicates.length - this.results.total) > (this.results.target-this.results[negate ? 'fails' : 'passes'])) {

            if (this.results[negate ? 'fails' : 'passes'] < this.results.target) {
                this.callbacks.reject(this.resolutions);
            } else {
                this.resolved = true;
                this.callbacks.resolve(this.resolutions)
            }

        }
    },

    digest() {
        let self = this;

        if (this.mode === PredicatePolicy.SOME) {
            this.target = 1;
        } else if (this.mode === PredicatePolicy.NONE) {
            this.target = this.predicates.length;
            this.negate = true;
        } else if (this.mode === PredicatePolicy.EVERY) {
            this.target = this.predicates.length;
        }

        return new Promise((resolve, reject) => {
            self.callbacks.resolve = resolve;
            self.callbacks.reject = reject;

            self.predicates.forEach(predicate => {
                Promise
                    .resolve(predicate)
                    .then(result => self.onResult(false, result))
                    .catch(reason => self.onResult(true, reason));
            });
        };
    }
};

PlatformPredicateDigest.create = function (mode, args, aggregate, negate, self) {
    let digest = Object.create(PlatformPredicateDigest);

    digest.predicates = Array.from(arguments).map((args) => {
        if (!upspark.util.isArray(args)) {
            args = [args];
        }
        return aggregate.apply(self, args);
    });
    digest.negate = negate;
    digest.mode = mode;

    return digest;
};

let PlatformConsumer = {
    predicates: [],
    action: "{{0}}"
};

PlatformConsumer.throwError = function (action, issue, examples) {
    if (arguments.length === 2) {
        examples = [];
        if (!upspark.util.isString(issue)) {
            if (upspark.util.isArray(issue)) {
                examples = issue;
                issue = examples.pop();
            } else if (issue.hasOwnProperty('examples') && issue.hasOwnProperty('message')) {
                examples = issue['examples'];
                issue = issue['message'];
            } else {
                issue = issue.toString();
            }
        }
    }

    if (!issue || !action) {
        throw `Command could not be built because of incorrect command execution chain${action ? ` at link ${action.toUpperCase()}` : ''}`;
    }

    examples = examples || [];

    throw `${issue} for the ${action.toUpperCase()} action.${ examples.length ? `\n${examples.join('\n\t\t')}` : '' }`;
};
PlatformConsumer.passiveConsumerFromArguments = function (action, examples, parameters) {
    if (!parameters.length) {
        return PlatformConsumer.throwError(action, 'A consumer callback is required', examples);
    }
    let consumer = Object.create(PlatformConsumer);
    consumer.action = parameters[0];

    if (parameters.length > 1) {
        consumer.action = Array.from(parameters);
    }

    consumer.action = PlatformProcessor.from(consumer.action);

    return consumer;
};
PlatformConsumer.conditionalConsumerFromArguments = function (action, examples, parameters, additionalParameters) {
    if (parameters.length < 1) {
        return PlatformConsumer.throwError(action, 'A predicate callback is required', examples);
    }
    let consumer = Object.create(PlatformConsumer);

    consumer.predicates = parameters.length === 1 ? (additionalParameters || []) : [parameters[0]].concat(additionalParameters || [])
    consumer.action = parameters[1];

    if (parameters.length > 2) {
        consumer.predicates.push(Array.from(parameters).slice(1, parameters.length - 1));
        consumer.action = parameters[parameters.length - 1];
    }

    consumer.predicates = upspark.util.deepMap(consumer.predicates, (arg) => PlatformProcessor.from(arg), true);
    consumer.action = PlatformProcessor.from(consumer.action);

    return consumer;
};
PlatformConsumer.buildCommandPredicateLink = function (predicateStack, self, handler) {

    let operation = function () {


        return this;
    };

    let matches = function (count, tests, negate) {
        let digest = PlatformPredicateDigest.create(
            count,
            arguments,
            operation,
            this
        );
        let predicate = digest.bind(digest);

        predicateStack.push(predicate);
        return this;
    };

    operation.across = function (collection) {
        return {
            matched(count) {
                matches(count, collection);

                return self;
            },
            failed(count) {
                matches(count, collection, true);

                return self;
            }
        };
    };
    operation.some = function () {
        return operation.matches(PredicatePolicy.SOME, arguments);
    };
    operation.every = function () {
        return operation.matches(PredicatePolicy.EVERY, arguments);
    };
    operation.none = function () {
        return operation.matches(PredicatePolicy.NONE, arguments);
    };

    return function () {
        return operation.apply(this, arguments);
    };
};

let PlatformCommand = {
    command: undefined,
    context: undefined,

    predicateStack: [],
    consumers: [],

    processor: function () {
        return this.command;
    },

    arguments: [],

    appendConsumer(consumer, clearPredicateStack) {
        this.consumers.push(consumer);

        if (clearPredicateStack) {
            this.predicateStack = [];
        }

        return this;
    },

    appendPassiveConsumer: function (action, examples, parameters, clearPredicateStack) {
        let consumer;

        if (this.predicateStack.length) {
            consumer = PlatformConsumer
                .passiveConsumerFromArguments(
                    action,
                    examples,
                    [parameters],
                    this.predicateStack
                );
        } else {
            consumer = PlatformConsumer
                .passiveConsumerFromArguments(
                    action,
                    examples,
                    parameters
                );
        }

        return this.appendConsumer(
            consumer,
            clearPredicateStack
        );

    },

    appendConditionalConsumer: function (action, examples, parameters, clearPredicateStack) {

        return this.appendConsumer(
            PlatformConsumer
                .passiveConsumerFromArguments(
                    action,
                    examples,
                    parameters,
                    this.predicateStack
                ),
            clearPredicateStack
        );
    },


    otherwiseWhen()
    {
        this.predicateStack = [];
        if (arguments.length === 0) {
            return this;
        }

        this.predicateStack.push(Array.from(arguments));
        return this;
    }
    ,

    otherwise()
    {
        this.predicateStack = [];
        if (arguments.length === 0) {
            return this;
        }

        return this.appendPassiveConsumer('otherwise', [
            'upspark.on("FOO").when("A", "B").otherwise("C")',
            'upspark.on("FOO").empty(":(").otherwise(arg => arg.toLowerCase())',
        ], arguments, true);
    }
    ,

    respond: function () {
        return this.appendPassiveConsumer('respond', [
            'upspark.on("FOO").respond("BAR")'
        ], arguments, false);
    }
    ,

    also: function () {
        return this.appendPassiveConsumer('also', [
            'upspark.on("FOO").respond("FOO").count(1).respond("FOO").also("BAR")'
        ], arguments, false);
    }
    ,


    counted: function (argumentCount) {
    },

    count: this.buildCommandPredicateLink(this.predicateStack, this,  {
            title: 'count',
            collector: () => {
                return arguments.length;
            },
            predicate: (options, count, resolve) => {
                if (options.gt) {
                    return count >= resolve.min;
                }
                if (resolve.max === -1) {
                    return count === resolve.min;
                }
                return count >= resolve.min && count <= resolve.max;
            },
            factory: {
                functions(processor) {
                    return function () {
                        return processor(arguments.length) !== false;
                    };
                }
            },
            resolve: {
                min: {
                    alias: ['argumentCount'],
                    init: (value) => value || 1,
                    validator(value) {
                        if (!upspark.util.isNumber(value)) {
                            return [
                                `The argument minimum count can not be ${value}. A number is required`,
                                'upspark.on("FOO").count(0).then(":-(").otherwise("{{$count}} ARGUMENTS")',
                                'upspark.on("FOO").count().then("{{$count}} ARGUMENTS").otherwise(":-(")'
                            ];
                        }
                        return true;
                    }
                },
                max: {
                    init(value, options) {
                        if (!upspark.util.isBoolean(value)) {
                            return value;
                        }
                        options.flexible = true;
                    },
                    validator(argument) {
                        if (!upspark.util.isNumber(max)) {
                            return [
                                `The argument maximum count can not be ${max}. A number is required`,
                                'upspark.on("FOO").count(0, 5).then("LESS THAN 5 ARGUMENTS").otherwise("GREATER THEN 5 ARGUMENTS")'
                            ]
                        }
                        return true;
                    }
                }
            },
        },

        then()
{
    return this.appendPassiveConsumer('respond', [
        'upspark.on("FOO").count().then("BAR")'
    ], arguments, false);
}
,

when: function () {

    if (arguments.length === 1) {
        this.predicateStack.push(arguments[0]);
        return this;
    }

    let consumer = PlatformConsumer.conditionalConsumerFromArguments('WHEN', [
        'upspark.on("FOO").when(undefined, ":-(").then("BAR > {{arg}}")',
        'upspark.on("FOO").when(undefined, ":-(").then("BAR > {{arg}}")'
    ], arguments, this.predicateStack);

    this.consumers.push(consumer);

    return this;
}
}
;
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
    __isPlatformProcessor: ':-)',
    executor() {
    }
};

PlatformProcessor.from = function (argument, fallback, processed) {
    if (upspark.util.isArray(argument) && !processed) {
        return PlatformProcessor.from(upspark.util.deepMap(argument, PlatformProcessor.from, true), fallback, true);
    }

    if (typeof argument !== 'undefined' && argument.hasOwnProperty('__isPlatformProcessor')) {
        return argument;
    }

    let processor = Object.create(PlatformProcessor);

    if (typeof argument === 'undefined') {
        processor.executor = function () {
            return fallback;
        };
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

    processor.executor = function () {
        return argument;
    };

    return processor;
};