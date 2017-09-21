var gulp = require('gulp'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    del = require('del');

gulp.task('default', function() {
  gulp.start('styles', 'scripts', 'html');
});

gulp.task('watch', function() {
  gulp.watch('src/**/*', ['default']);
});

gulp.task('styles', function() {
  return gulp.src('src/styles/**/*.css')
    .pipe(concat('style.css'))
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('scripts', function() {
  return gulp.src('src/scripts/**/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
});

