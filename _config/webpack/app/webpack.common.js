import Helpers from '../../helpers';
import {name, version} from '../../../package.json';
import Webpack from 'webpack';

const nodeExternals = require('webpack-node-externals');

let {DefinePlugin} = Webpack;

let config = {};

config.target = 'node';

(function(module, loaders) {

    module.exprContextRegExp = /$^/;
    module.unknownContextCritical = false;

    let typescript = {},
        css = {},
        text = {},
        json = {};
    
    typescript.test = /\.ts$/;
    typescript.loaders = [];
    typescript.loaders.push('ts-loader');

    css.test = /\.css$/;
    css.loaders = [];
    css.loaders.push('css-loader');

    json.test = /\.json$/;
    json.loader = 'json';

    text.test = /\.txt$/;
    text.loader = 'raw';

    loaders.push(
        typescript,
        json,
        text,
        css
    );

})(config.module = {}, config.module.loaders = []);

(function(entry) {

    entry.main = Helpers.path('_src', 'app', 'main.ts');

})(config.entry = {});

(function(plugins) {

    let define = (function(global) {
        global.APP_NAME = JSON.stringify(name);
        global.APP_VERSION = JSON.stringify(version);

        return new DefinePlugin(global);
    })({});


    plugins.push(
        define
    );

})(config.plugins = []);

(function(node) {
    
    node.__dirname = false;
    node.__filename = false;
    
})(config.node = {});
    

(function(externals) {

    externals.push(nodeExternals());

})(config.externals = []);

// module resolution
(function(resolve, alias, extensions, modules) {

    resolve.root = Helpers.path('src');

    extensions.push('');
    extensions.push('.ts');
    extensions.push('.js');
    extensions.push('.json');

    modules.push(Helpers.path('node_modules'));

})( config.resolve = {},
    config.resolve.alias = {},
    config.resolve.extensions = [],
    config.resolve.modulesDirectories = []);

export default config;