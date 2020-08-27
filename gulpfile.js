(function () {
    'use strict';

    require('events').EventEmitter.defaultMaxListeners = 100;

    const path = require('path');
    const glob = require('glob');

    const build = path.join(__dirname, 'build');

    glob.sync('gulpfile.*.js', { cwd: build })
        .forEach(f => require(`./build/${ f }`));
}());