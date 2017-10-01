var gulp = require('gulp'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    del = require('del'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util'),
    babelify = require('babelify');

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

  var b = browserify({
    entries: 'src/scripts/main.js',
    debug: true
  });

  return b
    .transform('babelify', {presets: ["env"]})
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadmaps: true}))
      .pipe(uglify())
      .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/scripts'));

  //return gulp.src('src/scripts/**/*.js')
  //  .pipe(concat('main.js'))
  //  .pipe(gulp.dest('dist/scripts'));
});

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
});

