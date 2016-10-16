import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import del from 'del';
import tsc from 'gulp-typescript';
import runElectron from 'gulp-run-electron';
import {PluginError, log, colors} from 'gulp-util';

import {series, src, dest, parallel, watch} from 'gulp';

import webpackDevelopmentConfig from './config/webpack/webpack.development';

let project = tsc.createProject('./tsconfig.json');
let tag = colors.white.bgBlue.bold(' Upspark ');
let init = false;

log(tag);

function highlight(value, noSpace) {
    value = noSpace ? value : ` ${value} `;
    return colors.white.bgYellow.bold(value);
}

export const clean = () => del(['dist']);
export const compile = () => src('./src/bootstrap.ts').pipe(project()).pipe(dest('dist'));
export const observeChanges = () => watch('./src/bootstrap.ts', redeploy);
export const webpackDevServer = () => {

    let compiler = new Webpack(webpackDevelopmentConfig);

    compiler.plugin('done', (stats) => {
        if(!init) {

            log(tag, `Bundling complete. Launching in ${highlight('DEV')} mode`);

            init = true;
            src('./').pipe(runElectron(["--dev"]))
        }
    });

    let options = {};

    options.stats = 'minimal';
    options.hot = true;
    options.inline = true;

    let server = new WebpackDevServer(
        compiler,
        options
    );

    server.listen(8080, (err) => {
        if (err) {
            throw new PluginError("webpack-dev-server", err);
        }
        log(tag, `The webpack dev server listening on port ${highlight('8000')}`);
        log(tag, `Bundling application...`);
    });

};

export const relaunch = (callback) => {
    log(tag, `Core module updated. ${high}`);
    if(!init) {
        callback();
        return;
    }
    return runElectron.rerun(callback);
};
export const redeploy = series(compile, relaunch);

export const build = series(clean, compile);
export const dev = series(build, parallel(observeChanges, webpackDevServer));

export default dev;