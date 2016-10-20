import merge from 'webpack-merge';
import electron from 'webpack-target-electron-renderer';
import Webpack from 'webpack';

import Helpers from '../../helpers';
import common from './webpack.common';

let {DefinePlugin} = Webpack;

let config = {};

(function(output) {

    output.path = Helpers.path('dist');
    output.publicPath = 'http://localhost:8080';
    output.filename = '[name].js';
    output.chunkFilename = '[id].chunk.js';

})(config.output = {});

(function(plugins) {

    let env = (function(config) {
        config['process.env.ENV'] = JSON.stringify('development');
        return new DefinePlugin(config);
    })({});
    
    plugins.push(
      env 
    );

})(config.plugins = []);

(function(server) {

    server.historyApiFallback = true;
    server.stats = 'minimal';

})(config.devServer = {});

config = merge(
    common,
    config
);

config.devtool = 'cheap-module-eval-source-map';
config.target  = electron(config);

export default config;