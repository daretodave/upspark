import {ResourceTranslator} from "../resource/resource-translator";
import {Log} from "./log";
import {EOL, arch, cpus, release, type} from 'os';
import * as _ from 'lodash';
import wrap = require("lodash/wrap");
import {LogMessage} from "./log-message";

declare let APP_VERSION:string;

const eolMatcher = new RegExp('(?:\r\n|\r|\n)', 'g');
const template:string = require('./log-template.txt').replace(eolMatcher, EOL);

const constants:any = {};

constants.lineLength = 50;
constants.version = APP_VERSION;
constants.tab = '\t';
constants.system = `${arch()} ${type()} ${release()} (${cpus().length} core)`;
constants.line = '-'.repeat(constants.lineLength);


const wordWrapMatcher = new RegExp('.{1,' + constants.lineLength + '}(\s|$)|\S+?(\s|$)', 'g');

export class LogTranslator implements ResourceTranslator {

    constructor(private init:Date) {
    }

    deserialize<T>(type: { new(...args: any[]): Log }, contents: string): Log {
        let log = new Log();

        return log;
    }

    static wrap(string:string): string[] {
        if (!string.length || string.length < constants.lineLength) {
            return [string];
        }

        return string.match( wordWrapMatcher);

    }

    static append(prefix:string, message:string, skipFirstPrefix:boolean, skipFinalEOL:boolean): string {
        let contents:string = '';
        let blocks:string[] = message.split(eolMatcher);
        blocks.forEach((block, blockIndex) => {
            const lines:string[] = LogTranslator.wrap(block);
            lines.forEach((line:string, lineIndex:number) => {
                if(!skipFirstPrefix || !(blockIndex === 0 && lineIndex === 0)) {
                    line = prefix + line;
                }
                if(!skipFinalEOL || !(blockIndex === blocks.length-1 && lineIndex === lines.length-1)) {
                    line = line + EOL;
                }
                contents = contents + line;
            });
        });
        return contents;
    }

    //2016-11-25 at 2:36 PM
    static getDateTitle(date: Date = new Date()) {
        let pm:boolean = false;

        let minute = date.getMinutes();
        let hour = date.getHours();

        if(hour > 12) {
            hour = hour-12;
            pm = true;
        }

        let hourString:string = (hour < 10 ? '0' : '') + hour;
        let minuteString:string = (minute < 10 ? '0' : '') + minute;

        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` +
                ' at ' +
                `${hourString}:${minuteString} ${pm ? 'PM' : 'AM'}`;
    }

    static replaceValue(contents:string, key:string, value: string) {
        return contents.replace(
            new RegExp('{{' + key + '}}', 'g'),
            value
        );
    }

    static getMessageText(logMessage:LogMessage, skipFinalEOL: boolean): string {
        let message:string = LogTranslator.getDateTitle(logMessage.date) + ' |';
        if(logMessage.error) {
            message += ' ERROR |';
        }
        message = `${message} ${logMessage.message}`;
        return LogTranslator.append('\t\t\t', message, true, skipFinalEOL);
    }

    serialize(model: Log): string {
        let contents:string = template;

        _.forOwn(
            constants,
            (value:any, key:string) => contents = LogTranslator.replaceValue(contents, key, value)
        );

        contents = LogTranslator.replaceValue(contents, 'last-log',  LogTranslator.getDateTitle());
        contents = LogTranslator.replaceValue(contents, 'last-boot', LogTranslator.getDateTitle(this.init));

        if(model.isLoggableError()) {
            contents = contents
                            .replace('{error-message}', LogTranslator.append('\t', model.error.message, false, false))
                            .replace('{error}', EOL)
                            .replace('{/error}', constants.line);
        } else {
            contents = contents.replace(/\{error}[\s\S]*?\{\/error}/, '');
        }

        contents = LogTranslator.replaceValue(
            contents,
            'contents',
            model.messages.reduce((accumulator, message) => accumulator + LogTranslator.getMessageText(message, false), '')
        );
        return contents;
    }

}