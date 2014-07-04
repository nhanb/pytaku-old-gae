/**
 * The only tasks you'll ever need to call are:
 *
 * $ gulp
 *   => Pull libraries with bower then compile everything.
 *      Run this once after `npm install`.
 *
 * $ gulp watch
 *   => Watch for changes in application code and trigger livereload.
 *
 * $ gulp deploy
 *   => Similar to default `gulp` task, but also minify JS + CSS.
 */

var gulp = require('gulp');
var react = require('gulp-react');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var minifycss = require('gulp-minify-css');
var notify = require('gulp-notify');
var bower = require('bower');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');

var env = 'DEVELOPMENT';

// Concat js libraries
gulp.task('jslib', function() {
    gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/bootstrap/dist/js/bootstrap.js',
        'bower_components/react/react.js',
        'bower_components/director/build/director.js',
    ])
    .pipe(gulpif(env == 'PRODUCTION', uglify()))
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('frontend-dist/static/js'));
});

// Concat css libraries
gulp.task('csslib', function() {
    gulp.src([
        'bower_components/normalize-css/normalize.css',
        'bower_components/bootstrap/dist/css/bootstrap.css',
        // Remember to copy fontawesome's `fonts` dir too
        'bower_components/fontawesome/css/font-awesome.css',
    ])
    .pipe(gulpif(env == 'PRODUCTION', minifycss()))
    .pipe(concat('lib.css'))
    .pipe(gulp.dest('frontend-dist/static/css'));

    // Extra files required by fontawesome
    gulp.src('bower_components/fontawesome/fonts/*')
    .pipe(gulp.dest('frontend-dist/static/fonts'));
});

// Download & concat all libraries
gulp.task('lib', function() {
    bower.commands.install([], {save: true}, {})
    .on('end', function(){
        gulp.start('csslib', 'jslib');
    });
});

// Compile application jsx
gulp.task('jsx', function() {
    gulp.src([
        'frontend/jsx/components/home.jsx',
        'frontend/jsx/components/register.jsx',
        'frontend/jsx/components/chapter.jsx',
        'frontend/jsx/components/title.jsx',
        'frontend/jsx/components/search.jsx',
        'frontend/jsx/*.jsx'
    ])
    .pipe(react())
    .on('error', notify.onError({message: 'JSX compilation failed!'}))
    .pipe(gulpif(env == 'PRODUCTION', uglify()))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('frontend-dist/static/js'));
});

// Application css
gulp.task('css', function() {
    gulp.src('frontend/css/**/*.css')
    .pipe(gulpif(env == 'PRODUCTION', minifycss()))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('frontend-dist/static/css'));
});

// Main html file. Nothing exciting here
gulp.task('html', function() {
    gulp.src('frontend/app.html')
    .pipe(gulpif(env =='PRODUCTION', htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('frontend-dist'));
});

// Because every kick-ass site has a kick-ass favicon
gulp.task('favicon', function() {
    gulp.src('frontend/favicon.ico')
    .pipe(gulp.dest('frontend-dist'));
});

// Download & build everything for development
gulp.task('default', [], function() {
    gulp.start('lib', 'jsx', 'css', 'html', 'favicon');
});

// Download & build & minify everything for deployment
gulp.task('deploy', function() {
    env = 'PRODUCTION';
    gulp.start('default');
});

// Watch for changes in application code and trigger livereload
gulp.task('watch', function() {

    // If there's a change in source code then build dist
    gulp.watch('frontend/css/**/*.css', ['css']);
    gulp.watch('frontend/jsx/**/*.jsx', ['jsx']);
    gulp.watch('frontend/app.html', ['html']);
    gulp.watch('frontend/favicon.ico', ['favicon']);

    // If there's a change in dist then trigger livereload
    var server = livereload();
    gulp.watch(['frontend-dist/**/*', 'frontend']).on('change', function(file) {
        server.changed(file.path);
    });
});
