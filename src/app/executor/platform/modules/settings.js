let comms = require('comms');

let Settings = module.exports = {};

const getCSSFromObject = (element, defaultSelector, order) => {

    let rules = {};

    const appendRule = (selector, property, rule) => {
        if (!rules.hasOwnProperty(selector)) {
            rules[selector] = [];
        }

        rules[selector].push([property, rule]);
    };

    Object
        .keys(element)
        .forEach(property => {
            const attributes = element[property];

            if (typeof attributes === 'object') {
                Object.keys(attributes)
                    .forEach(attribute => appendRule(
                        property,
                        attribute,
                        attributes[attribute]
                    ));

            } else {
                appendRule(
                    defaultSelector,
                    property,
                    attributes
                );

            }

        });

    let selectors = Object.keys(rules);

    if (order) {
        selectors
            .sort(
                (ruleA, ruleB) => order.indexOf(ruleA) - order.indexOf(ruleB)
            );
    }

    return selectors.reduce((css, selector) => {
        let selectorCSS = rules[selector].reduce(
            (block, keyValueCSS) => `${block}\n\t${keyValueCSS[0]}: ${keyValueCSS[1]};`,
            ''
        );

        return `${css}\n${selector} {${selectorCSS}\n}\n`;
    }, '');
};

Settings.reload = function (css) {
    return comms.message('SETTINGS.reload', css);
};

Settings.setRotation = function (value) {
    return comms.message('SETTINGS.setRotation', value);
};
Settings.setWidth = function (value) {
    return comms.message('SETTINGS.setWidth', value);
};
Settings.setHeight = function (value) {
    return comms.message('SETTINGS.setHeight', value);
};
Settings.setScreen = function (value) {
    return comms.message('SETTINGS.setScreen', value);
};
Settings.setX = function (value) {
    return comms.message('SETTINGS.setX', value);
};
Settings.setY = function (value) {
    return comms.message('SETTINGS.setY', value);
};
Settings.setOffsetX = function (value) {
    return comms.message('SETTINGS.setOffsetX', value);
};
Settings.setOffsetY = function (value) {
    return comms.message('SETTINGS.setOffsetY', value);
};
Settings.setHotkey = function (value) {
    return comms.message('SETTINGS.setHotkey', value);
};

Settings.setLocation = function (x, y) {
    return comms.message('SETTINGS.setLocation', {
        x: x,
        y: y
    });
};

Settings.setSize = function (w, h) {
    return comms.message('SETTINGS.setSize', {
        w: w,
        h: h
    });
};

Settings.setRunnerCSS = function (css, order) {
    if (typeof css === 'object') {
        css = getCSSFromObject(css, '#runner', order);
    }
    return comms.message('SETTINGS.SETRUNNERCUSTOMCSS', css);
};

Settings.setGlobalCSS = function (css, order) {
    if (typeof css === 'object') {
        css = getCSSFromObject(css, 'body', order);
    }
    return comms.message('SETTINGS.SETGLOBALCUSTOMCSS', css);
};
Settings.setRunnerTheme = function (theme) {
    return comms.message('SETTINGS.SETRUNNERTHEME', theme);
};
Settings.setGlobalTheme = function (theme) {
    return comms.message('SETTINGS.SETGLOBALTHEME', theme);
};

Settings.getSettings = function () {
    return comms.message('SETTINGS.GETSETTINGS');
};
Settings.getGlobalCSS = function () {
    return comms.message('SETTINGS.getGlobalCustomCSS');
};
Settings.getRunnerCSS = function () {
    return comms.message('SETTINGS.getRunnerCustomCSS');
};
Settings.getRotation = function () {
    return comms.message('SETTINGS.getRotation');
};
Settings.getSize = function () {
    return comms.message('SETTINGS.getSize');
};
Settings.getWidth = function () {
    return comms.message('SETTINGS.getWidth');
};
Settings.getHeight = function () {
    return comms.message('SETTINGS.getHeight');
};
Settings.getLocation = function () {
    return comms.message('SETTINGS.getLocation');
};
Settings.getX = function () {
    return comms.message('SETTINGS.getX');
};
Settings.getY = function () {
    return comms.message('SETTINGS.getY');
};
Settings.getOffsetX = function () {
    return comms.message('SETTINGS.getOffsetX');
};
Settings.getOffsetY = function () {
    return comms.message('SETTINGS.getOffsetY');
};
