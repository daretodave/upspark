import common from './webpack.common';
import Helpers from '../../helpers';
import merge from 'webpack-merge';

let config = {};

(function(output) {

    output.path = Helpers.path('dist');
    output.filename = '[name].js';

})(config.output = {});

config = merge(
    common,
    config
);

export default config;