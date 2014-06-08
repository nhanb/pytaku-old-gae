var gulp = require('gulp');
var react = require('gulp-react');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var minifycss = require('gulp-minify-css');

gulp.task('jsx', function() {
    gulp.src(['frontend/jsx/components/*.jsx', 'frontend/jsx/*.jsx'])
    .pipe(react())
    .pipe(concat('main.js'))
    .pipe(gulp.dest('frontend-dist/static'));
});

gulp.task('jslib', function() {
    gulp.src('frontend/lib/**/*.js')
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('frontend-dist/static'));
});

gulp.task('css', function() {
    gulp.src('frontend/css/**/*.css')
    .pipe(concat('main.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('frontend-dist/static'));
});

gulp.task('html', function() {
    gulp.src('frontend/app.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('frontend-dist'));
});

gulp.task('default', [], function() {
    gulp.start('jsx', 'jslib', 'css', 'html');
});

gulp.task('watch', function() {
    gulp.watch('frontend/css/**/*.css', ['css']);
    gulp.watch('frontend/jsx/**/*.jsx', ['jsx']);
    gulp.watch('frontend/lib/**/*.js', ['jslib']);
    gulp.watch('frontend/app.html', ['html']);

    var server = livereload();
    gulp.watch(['frontend-dist/**', 'frontend']).on('change', function(file) {
        server.changed(file.path);
    });
});
