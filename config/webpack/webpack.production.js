import CleanPlugin from 'clean-webpack-plugin';
import merge from 'webpack-merge';

let config = {};

(function(plugins) {

    // Clean dist directory
    let clean = (function(paths, config) {
        paths.push('dist');
        config.root = Helpers.path();
        config.verbose = false;

        return new CleanPlugin(paths, config);

    })([], {});

    plugins.push(
        clean
    );

})(config.plugins = []);

config = merge(
    common,
    config
);

export default config;