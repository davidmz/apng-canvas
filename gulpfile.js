var
    gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    append = require('gulp-append-prepend'),
    concat = require('gulp-concat');
    package = require('./package.json');

gulp.task('build', function () {
    var aboutText = "/**\n"+
    " * "+package.name+" v"+package.version+"\n"+
    " *\n"+
    " * @copyright 2011-"+(new Date().getFullYear())+" "+package.author+"\n"+
    " * @link "+package.homepage+"\n"+
    " * @license "+package.license+"\n"+
    " */\n";

    return gulp.src(['./src/main.js'])
        .pipe(browserify())
        .pipe(uglify())
        .pipe(append.prependText(aboutText))
        .pipe(concat('apng-canvas.min.js'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('devel', function () {
  return gulp.src(['./src/main.js'])
        .pipe(browserify({debug: true}))
        .pipe(concat('apng-canvas.js'))
        .pipe(gulp.dest('./test/'));
});

gulp.task('watch', function () { return gulp.watch('./src/*.js', ['devel']);});

gulp.task('default', gulp.series('build'));


