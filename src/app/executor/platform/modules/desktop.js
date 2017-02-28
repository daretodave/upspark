let comms = require('comms');

let Desktop = module.exports = {};

Desktop.TEXT = 'text';
Desktop.HTML = 'html';
Desktop.IMAGE = 'image';
Desktop.RTF = 'rtf';
Desktop.BOOKMARK = 'bookmark';

Desktop.setFindText = function(text) {
    return comms.message('DESKTOP.setFindText', text);
};

Desktop.setClipboard = function(result, format) {
    let message = {};

    if (typeof result === 'string') {
        message.mappings = {
            text: result
        }
    } else {
        message.mappings = result;
    }

    message.format = format;

    return comms.message('DESKTOP.setClipboard', message);
};

Desktop.setClipboardText = (text, format) => Desktop.setClipboard({
    text: text
}, format);

Desktop.setClipboardHTML = (html, format) => Desktop.setClipboard({
    html: html
}, format);

Desktop.setClipboardImage = (path, format) => Desktop.setClipboard({
    image: path
}, format);

Desktop.setClipboardRTF = (rft, format) => Desktop.setClipboard({
    rft: rft
}, format);

Desktop.setClipboardBookmark = (bookmark, format) => Desktop.setClipboard({
    bookmark: bookmark
}, format);

Desktop.setFindText = function(text) {
    return comms.message('DESKTOP.setFindText', text);
};

Desktop.getClipboardFormats = function(format) {
    return comms.message('DESKTOP.getClipboardFormats', format);
};

Desktop.getClipboardBookmark = function(format) {
    return comms.message('DESKTOP.getClipboardBookmark', format);
};

Desktop.getClipboardRTF = function(format) {
    return comms.message('DESKTOP.getClipboardRTF', format);
};

Desktop.getClipboardImage = function(format) {
    return comms.message('DESKTOP.getClipboardImage', format);
};

Desktop.getClipboardHTML = function(format) {
    return comms.message('DESKTOP.getClipboardHTML', format);
};

Desktop.getClipboardText = function(format) {
    return comms.message('DESKTOP.getClipboardText', format);
};

Desktop.getFindText = function() {
    return comms.message('DESKTOP.getFindText');
};

Desktop.beep = function() {
    return comms.message('DESKTOP.BEEP');
};

Desktop.openLocation = function(location) {
    return comms.message('DESKTOP.openLocation', location);
};

Desktop.moveItemToTrash = function(location) {
    return comms.message('DESKTOP.moveItemToTrash', location);
};

Desktop.open = function(location) {
    return comms.message('DESKTOP.open', location);
};

Desktop.openURI = function(location) {
    return comms.message('DESKTOP.openURI', location);
};
