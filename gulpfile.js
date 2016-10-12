var st = require('st'),
    gulp = require('gulp'),
    http = require('http'),
    open = require('gulp-open'),
    shell = require('gulp-shell'),
    livereload = require('gulp-livereload');

gulp.task('bundle', shell.task([
  'jspm bundle src/app.js dist/build.js -m --inject'
]));

gulp.task('chrome', function () {
  gulp.src('')
  .pipe(open({
    app: 'chrome',
    uri: 'http://localhost:8080'
  }));
});

gulp.task('server', function (done) {
  http.createServer(
    st({
      path: __dirname,
      index: 'index.html',
      cache: false
    })
  ).listen(8080, done);
});

gulp.task('default', ['server'], function() {
	livereload.listen({
		basePath: 'src'
	});
	gulp.start('chrome');
	gulp.watch('src/*', function () {
		livereload.reload();
	});
});