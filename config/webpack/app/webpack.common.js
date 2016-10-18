import Helpers from '../../helpers';

let config = {};

(function(module, loaders) {

    let typescript = {};
    
    typescript.test = /\.ts$/;
    typescript.loaders = [];
    typescript.loaders.push('ts-loader');


    loaders.push(
        typescript
    );

})(config.module = {}, config.module.loaders = []);

(function(entry) {

    entry.main = Helpers.path('src', 'app', 'main.ts');

})(config.entry = {});

(function(externals) {

    externals.electron = Helpers.imported('electron');
    externals.net = Helpers.imported('net');
    externals.shell = Helpers.imported('shell');
    externals.remote = Helpers.imported('remote');
    externals.app = Helpers.imported('app');
    externals.ipc = Helpers.imported('ipc');
    externals.fs = Helpers.imported('fs');
    externals.buffer = Helpers.imported('buffer');

    externals.system = externals.file ='{}';

})(config.externals = {});

// module resolution
(function(resolve, alias, extensions, modules) {

    resolve.root = Helpers.path('src');

    extensions.push('');
    extensions.push('.ts');
    extensions.push('.js');

    modules.push(Helpers.path('node_modules'));

})( config.resolve = {},
    config.resolve.alias = {},
    config.resolve.extensions = [],
    config.resolve.modulesDirectories = []);

export default config;