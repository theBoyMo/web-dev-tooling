/*
	References:
	[1] https://github.com/hdngr/treehouse-gulp-basics (course github repo)
	[2] https://github.com/contra/gulp-concat
	[3] https://github.com/dlmanning/gulp-sass
	[4] https://github.com/hparra/gulp-rename
	[5] https://github.com/terinjokes/gulp-uglify
	[6] https://alistapart.com/article/better-javascript-minification
	[7] http://thesassway.com/intermediate/using-source-maps-with-sass
	[8] https://github.com/gulp-sourcemaps/gulp-sourcemaps
	[9] http://blog.teamtreehouse.com/introduction-source-maps
	[10] https://github.com/gulpjs/gulp/blob/master/docs/API.md#async-task-support
	[11] https://github.com/isaacs/node-glob
	[11] http://gulpjs.com/
	[12] https://github.com/klei/gulp-inject
	[13] https://browsersync.io/docs/gulp/
	[14] https://github.com/pugjs/pug
	[15] https://github.com/gulpjs/gulp/tree/4.0 (github repo and sample gulpfile.js)
	[16] http://yeoman.io/
	[17] https://github.com/petecoop/generator-express (Express generator for Yeoman, supports Pug, Sass, MongoDB, Gulp)
	[18] https://github.com/hdngr/advanced-gulp-example
	
	Use Gulp to:
	1. build and deploy your app to production
	2. automate your work flow in your dev environment
	
	To run the http-server
	1. install globally (req'd once)
		$ npm i http-server -g
	2. run the server - specifying a port - default is 8080
		$ http-server -p 3000
 */

'use strict';
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const maps = require('gulp-sourcemaps');
const del = require('del');

// concat js files - order matters!
gulp.task('concatScripts', () => {
	return gulp.src([
		'js/jquery.js',
		'js/sticky/jquery.sticky.js',
		'js/main.js'])
		.pipe(maps.init())
		.pipe(concat('app.js'))
		.pipe(maps.write('./'))
		.pipe(gulp.dest('js'));
});

// minify js
// tasks are run in parallel, however some tasks depend upon others completing 1st.
// making concat-scripts a dependency of minify-scripts and adding the 'return' keyword
// ensures that minify-scripts will not start until concat-scripts has returned
// use the return keyword when a task depends on another task, otherwise not req'd
gulp.task('minifyScripts', ['concatScripts'], () => {
	return gulp.src('js/app.js')
		.pipe(uglify())
		.pipe(rename('app.min.js'))
		.pipe(gulp.dest('js'));
});

// compile sass
gulp.task('compileSass', () => {
	// application.scss imports all other required scss files
	return gulp.src('scss/application.scss')
		.pipe(maps.init())
		.pipe(sass())
		.pipe(rename('app.css'))
		.pipe(maps.write('./')) // path relative to that specified to gulp.dest()
		.pipe(gulp.dest('css'))
});

// build the production app
gulp.task('build', ['minifyScripts', 'compileSass'], () => {
	return gulp.src([
			'css/app.css',
			'js/app.min.js',
			'index.html',
			'img/**',
			'fonts/** '
		], {base: './'}) // maintain current folder structure, relative to the base path
		.pipe(gulp.dest('dist'));
});

// delete unnecessary files
gulp.task('clean', () => {
	del([
		'dist',
		'css/app.css*', // css and css.map files
		'js/app*.js*' // js, min.js, js.map
	])
});

// watch for sass & js changes
gulp.task('watchFiles', () => {
	gulp.watch('scss/**/*.scss', ['compileSass']);
	gulp.watch('js/main.js', ['concatScripts']);
});

// dev pipeline
gulp.task('dev', ['watchFiles']);

// production pipeline
gulp.task('default', ['clean'], () => {
	gulp.start('build'); // executed once clean has finished
});
