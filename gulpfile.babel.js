import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import del from 'del';
import runElectron from 'gulp-run-electron';
import {PluginError, log, colors} from 'gulp-util';
import {series, src, dest, parallel, watch} from 'gulp';

const config = {
    webpack : {
        app : {
            development : require('./config/webpack/app/webpack.development').default,
            production  : require('./config/webpack/app/webpack.production').default
        },
        www : {
            development : require('./config/webpack/www/webpack.development').default,
            production  : require('./config/webpack/www/webpack.production').default
        }
    },
    tag: colors.white.bgBlue.bold(' Upspark '),
    init: false
};

const webpack = (module, mode) => {
    return function pack(callback) {
        Webpack(config.webpack[module][mode], (err, stats) => {
            if (err) {
                throw new PluginError(`${config.tag} [webpack-${module}-${mode}]`, err);
            }
            log(`${config.tag} [webpack-${module}-${mode}]`, stats.toString({
                chunks: false,
                colors: true
            }));
            callback();
        });
    };
};

export const clean = () => del(['dist']);
export const cleanStaticFiles = () => del(['dist/static']);
export const webpackAppForDev  = webpack('app', 'development');
export const webpackAppForProd = webpack('app', 'production');
export const webpackWWWForProd = webpack('www', 'production');

export const copyStaticFiles = () =>
    src('./_src/static/**/*', {
        base: './_src/static/'
    })
        .pipe(dest('./dist/static'));
export const cleanCopyStaticFiles = () => series(cleanStaticFiles, copyStaticFiles);
export const relaunch = (callback) => {
    log(config.tag, `app`);
    
    if(!config.init) {
        callback();
        return;
    }
    
    return runElectron.rerun(callback);
};

export const redeploy = series(webpackAppForDev, relaunch);

export const observeChanges = () => {
    watch('./_src/app/**/*.ts', redeploy);
    watch('./_src/static/**/*', cleanCopyStaticFiles);
};

export const launch = () => {

    let compiler = Webpack(config.webpack.www.development);

    compiler.plugin('done', () => {
        if(config.init) {
            return;
        }
        config.init = true;
        src('./').pipe(runElectron(["--dev"]));
        log(config.tag, `Bundling complete. Launching in development mode`);
    });

    compiler.plugin('compile', () => {
        log(config.tag, `www`);
    });

    let options = config.webpack.www.development.devServer;

    let server = new WebpackDevServer(
        compiler,
        options
    );

    server.listen(8080, (err) => {
        if (err) {
            throw new PluginError("webpack-dev-server", err);
        }
        log(config.tag, `The webpack dev server listening on port 8080`);
        log(config.tag, `Bundling application...`);
    });

};



export const dev = series(clean, copyStaticFiles, webpackAppForDev, parallel(observeChanges, launch));
export const deploy = series(clean, copyStaticFiles, webpackAppForProd, webpackWWWForProd);

export default dev;