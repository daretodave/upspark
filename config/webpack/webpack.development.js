import merge from 'webpack-merge';
import electron from 'webpack-target-electron-renderer';

import helpers from '../shared/helpers';
import common from './webpack.common';

let config = {};

(function(output) {

    output.path = helpers.path('dist');
    output.publicPath = 'http://localhost:8080';
    output.filename = '[name].js';
    output.chunkFilename = '[id].chunk.js';

})(config.output = {});

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