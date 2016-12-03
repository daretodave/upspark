const gutil = require('gulp-util');

export class Printer {

    constructor(private tag:string) {
        this.tag = gutil.colors.yellow(tag);
    }

    print(error:boolean, plain:boolean, arg:any) {
        let message:string = arg;
        let blocks = message.split("|", 2);
        if(blocks.length > 1 && plain) {
            message = blocks[1].trim();
        }

        let block:any;
        if(error) {
            block = gutil.colors.red('ERROR');
        } else {
            block = gutil.colors.blue('INFO');
        }
        if(!plain) {
            gutil.log(this.tag, block, message);
        } else {
            gutil.log(message);
        }

        if(error) {
            gutil.beep();
        }
    }

}