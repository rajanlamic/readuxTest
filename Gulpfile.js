/**
 * Created by Rajan on 11/11/2015.
 */

var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var browserify = require("gulp-browserify");
var argv = require('yargs').argv;

gulp.task("buildSample", function () {
    return gulp.src("sample/src/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel({
            "presets": ["es2015"],
            "plugins": ['add-module-exports']

        }))
        .pipe(concat("all.js"))
        .pipe(browserify(
            {
                debug: true,
                transform: ['babelify']
            }
        ))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist"));
});

gulp.task("buildWithReact", function () {
    return gulp.src("withReact/src/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel({
            "presets": ["react", "es2015"],
            "plugins": ['add-module-exports']

        }))
        .pipe(concat("all.js"))
        .pipe(browserify(
            {
                debug: true,
                transform: ['babelify']
            }
        ))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("withReact/dist"));
});


gulp.task("build", function () {
    return gulp.src(argv.site + "/src/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel({
            "presets": ["react", "es2015"],
            "plugins": ['add-module-exports']

        }))
        .pipe(concat("all.js"))
        .pipe(browserify(
            {
                debug: true,
                transform: ['babelify']
            }
        ))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(argv.site + "/dist"));
});


gulp.task('watch', ['build'], function () {
    gulp.watch('src/*.js', ['build']);
});

gulp.task('default', ['watch']);