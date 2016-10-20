import common from './webpack.common';
import Helpers from '../../helpers';
import merge from 'webpack-merge';
import Webpack from 'webpack';

let {DefinePlugin} = Webpack;

let config = {};

(function(output) {

    output.path = Helpers.path('dist');
    output.filename = '[name].js';

})(config.output = {});

(function(plugins) {

    let env = (function(config) {
        config['process.env.NODE_ENV'] = JSON.stringify('development');
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