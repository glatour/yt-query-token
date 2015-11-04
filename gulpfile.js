var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  bowerFiles = require('main-bower-files'),
  connect = require('gulp-connect'),
  watch = require('gulp-watch'),
  es = require('event-stream'),
  pkg = require('./package.json');

var paths = {
  src: './src',
  dist: './dist'
}

var pipes = {};

pipes.buildVendorsScripts = function() {
  var vendorsJs = gulp.src(bowerFiles('**/*.js'))
    .pipe(plugins.order(['jquery.js', 'Bacon.js', 'angular.js', 'angular-bacon.js']))
    .pipe(plugins.concat('vendors.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('vendors.min.js'))
    .pipe(gulp.dest(paths.dist));

  return vendorsJs;
}

pipes.buildAppScripts = function() {

  var appJs = gulp.src(paths.src + '/*.js');

  var appHtml = gulp.src(paths.src + '/*.html')
    .pipe(plugins.htmlmin({
      collapseWhitespace: true
    }))
    .pipe(plugins.angularTemplatecache('html-templates.js', {
      module: pkg.name
    }));

  return es.merge([appJs, appHtml])
    .pipe(plugins.order(['query.js']))
    .pipe(plugins.concat('yt-query-token.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('yt-query-token.min.js'))
    .pipe(gulp.dest(paths.dist));
}

pipes.build = function() {
  var self = {};
  self.vendorsScripts = pipes.buildVendorsScripts();
  self.buildAppScripts = pipes.buildAppScripts();
}

gulp.task('connect', function() {
  connect.server({
    port: 9292,
    root: 'src'
  });
});

gulp.task('html', function() {
  gulp.src('./*.html')
    .pipe(connect.reload());
});

gulp.task('build', function() {
  pipes.build();
})

gulp.task('watch', function() {
  plugins.livereload.listen();

  plugins.watch([paths.src + '/**/*.html'], function() {
    pipes.build();
    plugins.livereload();
  });
  plugins.watch([paths.src + '/*.js'], ['html']);
});

gulp.task('default', ['connect', 'watch']);