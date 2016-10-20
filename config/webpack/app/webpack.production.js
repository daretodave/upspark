import common from './webpack.common';
import merge from 'webpack-merge';
import Webpack from 'webpack';

let {DefinePlugin} = Webpack;

let config = {};

(function(plugins) {

    let env = (function(config) {
        config['process.env.ENV'] = JSON.stringify('production');
        return new DefinePlugin(config);
    })({});

    plugins.push(
        env
    );

})(config.plugins = []);

config = merge(
    common,
    config
);

export default config;