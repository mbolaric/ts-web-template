(function () {
	'use strict';
	const gulp = require('gulp');
	const filter = require('gulp-filter');
	const gulpEslint = require('gulp-eslint');
	const vfs = require('vinyl-fs');

	const all = [
		'*',
		'build/**/*',
		'scripts/**/*',
		'src/**/*',
		'test/**/*',
		'!**/node_modules/**'
	];

	const eslintFilter = [
		'src/**/*.js',
		'src/**/*.ts',
		'build/gulpfile.*.js',
		'!src/app/vendors/**',
		'!**/test/**'
	];

	gulp.task('eslint', () =>
		vfs.src(all, { base: '.', follow: true, allowEmpty: true })
			.pipe(filter(eslintFilter))
			.pipe(gulpEslint('.eslintrc'))
			.pipe(gulpEslint.formatEach('compact'))
			.pipe(gulpEslint.failAfterError())
	);

	gulp.task('hygiene', gulp.parallel(['eslint']));
}());