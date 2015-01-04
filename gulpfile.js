var
    gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    addsrc = require('gulp-add-src'),
    concat = require('gulp-concat');

gulp.task('build', function () {
    gulp.src(['./src/main.js'])
        .pipe(browserify())
        .pipe(uglify())
        .pipe(addsrc.prepend('./src/about.js'))
        .pipe(concat('apng-canvas.min.js'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('devel', function () {
    gulp.src(['./src/main.js'])
        .pipe(browserify({debug: true}))
        .pipe(concat('apng-canvas.js'))
        .pipe(gulp.dest('./test/'));
});

gulp.task('watch', function () { gulp.watch('./src/*.js', ['devel']);});

gulp.task('default', ['devel']);


