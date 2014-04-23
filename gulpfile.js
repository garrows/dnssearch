var gulp = require("gulp"),
  jshint = require("gulp-jshint"),
  jsreporter = require("jshint-stylish"),
  shell = require("gulp-shell");

gulp.task("jshint", function () {
  gulp.src("./dnssearch.js")
    .pipe(jshint())
    .pipe(jshint.reporter(jsreporter));
});

gulp.task("test", function () {
  gulp.src("")
    .pipe(shell(["npm test"]));
});

gulp.task("default", ["build", "test"]);
gulp.task("build", ["jshint"]);