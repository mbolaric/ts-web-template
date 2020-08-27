(function () {
    'use strict';

    const gulp = require('gulp');
    const path = require('path');
    const es = require('event-stream');
    const connect = require('gulp-connect');
    const ts = require('gulp-typescript');
    const sourcemaps = require('gulp-sourcemaps');
    const filter = require('gulp-filter');
    const util = require('./lib/util');
    const rootDir = path.join(__dirname, '../', 'src');
    const tsProjectPath = path.join(rootDir, 'tsconfig.json');

    let sourcemapOptions = {
        sourceRoot: util.toFileUri(rootDir)
    };

    let tsConfigSrc = ts.createProject(tsProjectPath, {
        rootDir: rootDir
    });

    function compileTask(out, includeSourcemaps = true) {
        let compuleFunction = (done) => {
            const noFolderFilter = filter(['**', '!src/app/vendors/', '!src/app/sass/', '!src/app/css/'], { restore: true });

            const src = es.merge(
                gulp.src('src/**/*.ts'),
                gulp.src('node_modules/typescript/lib/lib.d.ts'),
                gulp.src('node_modules/@types/**/index.d.ts')
            );

            let build;
            if (includeSourcemaps) {
                build = src
                    .pipe(sourcemaps.init())
                    .pipe(tsConfigSrc())
                    .pipe(sourcemaps.write('.', sourcemapOptions))
                    .pipe(gulp.dest(out));
            } else {
                build = src
                    .pipe(tsConfigSrc())
                    .pipe(gulp.dest(out));
            }

            const copySrc = gulp.src(['./src/**/*.js', './src/**/*.html', './src/**/*.css'])
                .pipe(noFolderFilter)
                .pipe(gulp.dest(out));
            const copyVendors = gulp.src(['./src/app/vendors/**'])
                .pipe(gulp.dest(path.join(out, 'app/vendors/')));

            let tasks = [build, copySrc, copyVendors];
            tasks.forEach((task) => {
                task.on('end', () => util.exitProcess(false, done));
                task.on('error', () => util.exitProcess(true, done));
            });

            return tasks;
        };

        compuleFunction.taskName = 'build';
        compuleFunction.displayName = "build";

        return compuleFunction;
    }

    gulp.task('connect', function () {
        connect.server({
          root: './out/app',
          livereload: true
        });
    });

    function copyStaticFiles(out) {
        let copyFunction = (done) => gulp.src(['./src/**/*.html', './src/**/*.js', './src/**/*.css'])
            .pipe(gulp.dest(out))
            .on('end', () => util.exitProcess(false, done))
            .on('error', () => util.exitProcess(true, done));

        copyFunction.taskName = 'copy-static-files';
        copyFunction.displayName = "copy-static-files";

        return copyFunction;
    }

    gulp.task('watch-app', function () {
        gulp.watch(['./src/**/*.html', './src/**/*.js', './src/**/*.css'], gulp.series([copyStaticFiles('out')]));
        gulp.watch(['./src/**/*.ts', './src/**/*.js', './src/**/*.html', './src/**/*.css'], gulp.series(['compile']));
    });

    gulp.task('clean-app', gulp.series(util.rimraf('out')));
    gulp.task('compile-app', gulp.series('clean-app', compileTask('out')));

    // All
    gulp.task('clean', gulp.parallel(['clean-app']));
    gulp.task('compile', gulp.parallel(['compile-app']));
    gulp.task('watch', gulp.parallel('watch-app'));

    // Default
    gulp.task('default', gulp.parallel(['connect', 'watch', 'compile']));
}());