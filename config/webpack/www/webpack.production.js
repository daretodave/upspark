import merge from 'webpack-merge';
import Helpers from "../../helpers";
import common from './webpack.common';

let config = {};

(function(plugins) {
    
})(config.plugins = []);

config = merge(
    common,
    config
);

export default config;