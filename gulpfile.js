// http://www.bebetterdeveloper.com/coding/es6-react-babel.html

var gulp  = require('gulp');
var react = require('gulp-react');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('transform', function () {
  return gulp.src('./static/src/*.js')
        .pipe(react({harmony: false, es6module: true}))
        .pipe(gulp.dest('./static/build'));
});

gulp.task('es6', ['transform'], function () {
  return gulp.src('./static/build/*.js')
        .pipe(babel())
        .pipe(gulp.dest('./static/build'));
});

gulp.task("compress", ["es6"], function () {
  return gulp.src('./static/build/!(*.min).js')
      .pipe(uglify())
      .pipe(rename({ suffix: ".min" }))
      .pipe(gulp.dest('./static/build'))
});

gulp.task('build', ['compress']);
gulp.task('default', ['compress']);
