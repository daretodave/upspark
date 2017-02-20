import merge from 'webpack-merge';
import Webpack from 'webpack';


import Helpers from '../../helpers';
import common from './webpack.common';

let {DefinePlugin, HotModuleReplacementPlugin} = Webpack;
let config = {};

(function(output) {

    output.path = Helpers.path('dist');
    output.publicPath = 'http://localhost:8080/';
    output.filename = '[name].js';
    output.chunkFilename = '[id].chunk.js';

})(config.output = {});

(function(plugins) {

    let env = (function(config) {
        config['process.env.ENV'] = JSON.stringify('development');
        return new DefinePlugin(config);
    })({});

    let hmr = (function() {
        return new HotModuleReplacementPlugin();
    })();


    plugins.push(
        env,
        hmr
    );

})(config.plugins = []);

(function(server) {

    server.historyApiFallback = true;
    server.stats = 'minimal';
    server.inline = true;
    server.hot = true;

})(config.devServer = {});

config = merge(
    common,
    config
);

//config.entry['bundle'].unshift("webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server");

export default config;