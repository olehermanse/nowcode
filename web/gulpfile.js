var gulp = require('gulp'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    del = require('del'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    babelify = require('babelify'),
    inline = require('gulp-inline-source'),
    fs = require('fs'),
    path = require('path');

gulp.task('default', function(done) {
  gulp.series(['styles', 'scripts', 'html'], 'inline')();
  done();
});

gulp.task('watch', gulp.series('default', function() {
  gulp.watch(['src/**/*'], ['default']);
}));

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
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/scripts'));

});

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('inline', function(done) {
  htmlpath = path.resolve('dist/index.html');
  inline(htmlpath, {
    compress: true,
    rootpath: path.resolve('dist'),
  }, function(err, html){
    fs.writeFileSync('dist/index.html', html);
  });
  done();
});
