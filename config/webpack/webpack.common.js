import Helpers from '../shared/helpers';

import Webpack from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';

let {CommonsChunkPlugin} = Webpack.optimize;

let config = {};

(function(module, loaders) {

    let typescript = {},
        html = {};

    typescript.test = /\.ts$/;
    typescript.loaders = [];
    typescript.loaders.push('awesome-typescript-loader');
    typescript.loaders.push('angular2-template-loader');

    html.test = /\.html$/;
    html.loader = 'html';

    loaders.push(
        typescript,
        html
    );

})(config.module = {}, config.module.loaders = []);

(function(plugins) {

    // Chunks required only for www module
    let www = [];

    www.push("app/app");
    www.push("app/include/vendors");
    www.push("app/include/polyfills");

    // Make sure shared dependencies don't double up
    let common = (function(config) {
        config.name = www;

        return new CommonsChunkPlugin(config);
    })({});

    // Inject app dependencies into the html
    let html = (function(config) {
        config.template = Helpers.path('src', 'www', 'index.html');
        config.filename = 'app/app.html';
        config.chunks   = www;

        return new HtmlPlugin(config);
    })({});

    plugins.push(
        common,
        html
    );

})(config.plugins = []);

(function(entry) {

    entry['app/app'] = Helpers.path('src', 'www', 'index.ts');
    entry['app/include/vendors'] = Helpers.path('src', 'www', 'lib', 'vendors.ts');
    entry['app/include/polyfills'] = Helpers.path('src', 'www', 'lib', 'polyfills.ts');

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

    extensions.push("");
    extensions.push(".ts");
    extensions.push(".js");

    modules.push(Helpers.path("node_modules"));

})( config.resolve = {},
    config.resolve.alias = {},
    config.resolve.extensions = [],
    config.resolve.modulesDirectories = []);

export default config;