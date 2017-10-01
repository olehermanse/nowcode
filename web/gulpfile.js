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
    babelify = require('babelify'),
    inline = require('inline-source'),
    fs = require('fs'),
    path = require('path');
    gulpSequence = require('gulp-sequence');

gulp.task('default', function() {
  gulpSequence(['styles', 'scripts', 'html'], 'inline')();
});

gulp.task('watch', ['default'], function() {
  gulp.watch(['src/**/*'], ['default']);
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

});

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('inline', function() {
  htmlpath = path.resolve('dist/index.html');
  inline(htmlpath, {
    compress: true,
    rootpath: path.resolve('dist'),
  }, function(err, html){
    fs.writeFileSync('dist/index.html', html);
  });
});

