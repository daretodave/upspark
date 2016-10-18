import common from './webpack.common';
import merge from 'webpack-merge';

let config = {};

config = merge(
    common,
    config
);

export default config;