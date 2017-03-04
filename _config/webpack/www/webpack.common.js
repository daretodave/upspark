import Helpers from '../../helpers';

import Webpack from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';
import {name, version} from '../../../package.json';

let {ProvidePlugin, DefinePlugin, ExternalsPlugin} = Webpack;
let {CommonsChunkPlugin} = Webpack.optimize;

let config = {};

config.target = 'electron-renderer';

(function(module, loaders) {

    let typescript = {},
        html = {},
        scss = {},
        css  = {},
        assets = {},
        json = {};

    typescript.test = /\.ts$/;
    typescript.loaders = [];
    typescript.loaders.push('awesome-typescript-loader');
    typescript.loaders.push('angular2-template-loader');

    html.test = /\.html$/;
    html.loader = 'html';

    scss.test = /\.scss$/;
    scss.exclude = /node_modules/;
    scss.loaders = [];
    scss.loaders.push('style');
    scss.loaders.push('css');
    scss.loaders.push('sass');

    css.test = /\.css/;
    css.loaders = [];
    css.loaders.push('style');
    css.loaders.push('css');

    assets.test = /\.(png|woff|woff2|eot|ttf|svg)$/;
    assets.loader = 'url-loader?limit=100000';

    json.test = /\.json$/;
    json.loader = 'json';

    loaders.push(
        typescript,
        html,
        css,
        assets,
        scss,
        json
    );

})(config.module = {}, config.module.loaders = []);

(function(plugins) {

    // Chunks required only for www module
    let www = [];

    www.push('bundle');
    www.push('include/vendors');
    www.push('include/polyfills');

    // Make sure shared dependencies don't double up
    let common = (function(config) {
        config.name = www;

        return new CommonsChunkPlugin(config);
    })({});

    // Inject app dependencies into the html
    let html = (function(config) {
        config.template = Helpers.path('src', 'www', 'index.ejs');
        config.filename = 'index.html';
        config.chunks   = www;

        return new HtmlPlugin(config);
    })({});

    let provide = (function(global) {
        global.$ = global.jQuery ="jquery";

        return new ProvidePlugin(global);
    })({});

    let define = (function(global) {
        global.APP_NAME = JSON.stringify(name);
        global.APP_VERSION = JSON.stringify(version);

        return new DefinePlugin(global);
    })({});


    plugins.push(
        common,
        html,
        provide,
        define
    );

})(config.plugins = []);

(function(entry) {

    entry['bundle'] = [Helpers.path('src', 'www', 'index.ts')];
    entry['include/vendors'] = [Helpers.path('src', 'www', 'lib', 'vendors.ts')];
    entry['include/polyfills'] = [Helpers.path('src', 'www', 'lib', 'polyfills.ts')];

})(config.entry = {});

// module resolution
(function(resolve, alias, extensions, modules) {

    resolve.root = Helpers.path('src');

    extensions.push('');
    extensions.push('.ts');
    extensions.push('.js');

    modules.push(Helpers.path('node_modules'));

})( config.resolve = {},
    config.resolve.alias = {},
    config.resolve.extensions = [],
    config.resolve.modulesDirectories = []);

export default config;