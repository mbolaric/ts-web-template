(function () {
    'use strict';
    const path = require('path');
    const rimraf = require('rimraf');

    exports.toFileUri = filePath => {
        const match = filePath.match(/^([a-z])\:(.*)$/i);

        if (match) {
            filePath = '/' + match[1].toUpperCase() + ':' + match[2];
        }

        return 'file://' + filePath.replace(/\\/g, '/');
    };

    exports.rimraf = (dir) => {
        let retries = 0;

        const retry = cb => {
            rimraf(dir, { maxBusyTries: 1 }, err => {
                if (!err) return cb();
                if (err.code === 'ENOTEMPTY' && ++retries < 5) return setTimeout(() => retry(cb), 10);
                else return cb(err);
            });
        };

        let clean = cb => retry(cb);
        clean.taskName = 'clean-rimraf';
        clean.displayName = "clean-rimraf";
        return clean;
    };

    exports.exitProcess = (haveError, done) => {
        if (haveError) {
            done();
            process.exit(-1);
        }
        done();
    };
}());