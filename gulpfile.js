var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  bowerFiles = require('main-bower-files'),
  connect = require('gulp-connect'),
  watch = require('gulp-watch');

var paths = {
  src: './src',
  dist: './dist'
}

var pipes = {};

pipes.buildVendorsScripts = function() {
  var vendorsJs = gulp.src(bowerFiles('**/*.js'))
    .pipe(plugins.order(['jquery.js', 'Bacon.js', 'angular.js', 'angular-bacon.js']))
    .pipe(plugins.concat('vendors.js'))
    //.pipe(plugins.uglify())
    .pipe(plugins.rename('vendors.min.js'))
    .pipe(gulp.dest(paths.dist));

  return vendorsJs;
}

pipes.buildAppScripts = function() {

  var appJs = gulp.src(paths.src + '/*.js')
    .pipe(plugins.concat('yt-query-token.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('yt-query-token.min.js'))
    .pipe(gulp.dest(paths.dist));

  return appJs;


  // var htmlJsTemplates = gulp.src(paths.src + '/**/*.html')
  //   .pipe(plugins.angularTemplatecache('html-templates.js', {
  //     root: '/dist/app'
  //   }));

  // var vendorsJs = gulp.src(paths.src + '/**/*.html')
  //   .pipe(plugins.concat('vendors.js'))
  //   .pipe(plugins.uglify())
  //   .pipe(plugins.rename('vendors.min.js'))
  //   .pipe(gulp.dest(paths.dist));

  // return vendorsJs;
}

pipes.build = function() {
  var self = {};
  self.vendorsScripts = pipes.buildVendorsScripts();
  self.buildAppScripts = pipes.buildAppScripts();
  // self.appHtml = pipes.buildAppHtml();
  // self.appScripts = pipes.buildAppScripts();
  // self.appCss = pipes.buildAppCss();

  // return gulp.src(paths.index)
  //   .pipe(plugins.inject(self.vendorsScripts, {
  //     ignorePath: '/public',
  //     name: 'bower'
  //   }))
  //   .pipe(plugins.inject(es.merge(self.appScripts, self.appCss), {
  //     ignorePath: '/public'
  //   }))
  //   .pipe(gulp.dest('./server/views'))
  //   .pipe(plugins.notify('build completed!'));
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