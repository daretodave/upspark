import merge from 'webpack-merge';
import Webpack from 'webpack';
import Helpers from '../../helpers';

let {DefinePlugin} = Webpack;

let config = {};

const reload = require('require-reload')(require);

let common = reload('./webpack.common')['default'];

(function(output) {

    output.path = Helpers.path('dist');
    output.filename = '[name].js';
    output.chunkFilename = '[id].chunk.js';

})(config.output = {});

(function(plugins) {

    let env = (function(config) {
        config['process.env.ENV'] = JSON.stringify('production');
        return new DefinePlugin(config);
    })({});

    let uglify = (function(config) {
        config.compress = {};
        config.compress.warnings = false;

        return new Webpack.optimize.UglifyJsPlugin(config);
    })({});

    plugins.push(
        env,
        //uglify
    );

})(config.plugins = []);

config = merge(
    common,
    config
);


export default config;