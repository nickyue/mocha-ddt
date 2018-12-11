var gulp = require('gulp');
var install = require('gulp-install');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var run = require('gulp-run-command').default;

gulp.task('test', run('istanbul cover ./test/test_main.js'));

gulp.task('coverage', ['test'], run(['ls ./node_modules/.bin', 'cat ./coverage/lcov.info | ./node_modules/.bin/coveralls']));

gulp.task('install', function() {
    gulp.src(['./package.json'])
        .pipe(install());
});

gulp.task('install-global', run('npm install -g istanbul@1.0.0-alpha.2'));

gulp.task('default', ['coverage']);