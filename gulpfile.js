const { src, dest, series, parallel, watch} = require('gulp');

var rename = require("gulp-rename"),
  concat = require("gulp-concat"),
  del = require("del"),
  browserify = require("browserify"),
  source = require("vinyl-source-stream"),
  buffer = require("vinyl-buffer"),
  uglify = require("gulp-uglify"),
  sourcemaps = require("gulp-sourcemaps"),
  babelify = require("babelify"),
  inlinesource = require("gulp-inline-source"),
  fs = require("fs"),
  path = require("path");

function styles() {
  return src("frontend/src/styles/**/*.css")
    .pipe(concat("style.css"))
    .pipe(dest("frontend/dist/styles"));
}

function scripts() {
  var b = browserify({
    entries: "frontend/src/scripts/main.js",
    debug: true,
  });

  return b
    .transform("babelify", { presets: ["@babel/preset-env"] })
    .bundle()
    .pipe(source("main.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadmaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(dest("./frontend/dist/scripts"));
}

function html() {
  var options = {
    compress: false,
    rootpath: path.resolve("frontend/dist"),
  };

  return src('./frontend/src/index.html')
    .pipe(inlinesource(options))
    .pipe(dest('./frontend/dist'));
}

function copy() {
  return src('./frontend/src/favicon.ico')
    .pipe(dest('./frontend/dist/'));
}

exports.default = series(
  parallel(
    styles, scripts, copy
  ),
  html
);

function mywatch(callback) {
    watch(
      ["frontend/src/**/*"],
      exports.default
    );
    callback();
}

exports.watch = mywatch;
