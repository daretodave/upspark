import Helpers from '../../helpers';

import Webpack from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';

let {ProvidePlugin} = Webpack;
let {CommonsChunkPlugin} = Webpack.optimize;

let config = {};

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
        config.template = Helpers.path('src', 'www', 'index.html');
        config.filename = 'index.html';
        config.chunks   = www;

        return new HtmlPlugin(config);
    })({});

    // Inject app dependencies into the html
    let provideJQuery = (function(config) {
        config.$ = config.jQuery ="jquery";
        return new ProvidePlugin(config);
    })({});


    plugins.push(
        common,
        html,
        provideJQuery
    );

})(config.plugins = []);

(function(entry) {

    entry['bundle'] = Helpers.path('src', 'www', 'index.ts');
    entry['include/vendors'] = Helpers.path('src', 'www', 'lib', 'vendors.ts');
    entry['include/polyfills'] = Helpers.path('src', 'www', 'lib', 'polyfills.ts');

})(config.entry = {});

// established 'globals' to assist compile step
(function(externals) {

    externals.electron = Helpers.imported('electron');
    externals.net = Helpers.imported('net');
    externals.shell = Helpers.imported('shell');
    externals.remote = Helpers.imported('remote');
    externals.app = Helpers.imported('app');
    externals.ipc = Helpers.imported('ipc');
    externals.fs = Helpers.imported('fs');
    externals.buffer = Helpers.imported('buffer');

    externals.system = externals.file ='{}';

})(config.externals = {});

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