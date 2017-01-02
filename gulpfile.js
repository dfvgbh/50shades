var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync  = require('browser-sync'),
    useref       = require('gulp-useref'),
    gulpIf       = require('gulp-if'),
    uglify       = require('gulp-uglify'),
    cssnano      = require('gulp-cssnano'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    del          = require('del'),
    runSequence  = require('run-sequence');

var dist        = './dist',
    sassFiles   = './app/sass/**/*.+(sass|scss)',
    htmlFiles   = './app/*.html',
    jsFiles     = './app/js/**/*.js',
    imageFiles  = './app/images/**/*.+(png|jpg|jpeg|gif|svg)';

// browser-sync init
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  });
});

// compile sass
gulp.task('sass', function() {
  return gulp.src(sassFiles)
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie >= 8'], { cascade: true }))
  .pipe(gulp.dest('./app/css'))
  .pipe(browserSync.reload({ stream: true }));
});

// clear cache
gulp.task('clear-cache', function () {
    return cache.clearAll();
});

// minimazing images
gulp.task('imagemin', function(){
  return gulp.src(imageFiles)
  .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
  .pipe(gulp.dest(dist + '/images'));
});

// copy fonts
gulp.task('fonts', function() {
  return gulp.src('./app/fonts/**/*')
  .pipe(gulp.dest(dist + '/fonts'));
});

// copy db
gulp.task('db', function() {
  return gulp.src('./app/db/**/*')
  .pipe(gulp.dest(dist + '/db'));
});

// clean dist folder
gulp.task('clear-dist', function() {
  return del.sync(dist + '/*');
});

// useref: concatination, uglifying js
// minimizing css
gulp.task('useref', function(){
  return gulp.src(htmlFiles)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// build
gulp.task('build', function (callback) {
  runSequence(['clear-dist', 'clear-cache'], 
    'sass',
    ['useref', 'imagemin', 'fonts', 'db'],
    callback
  );
});

// watcher
gulp.task('watch', function() {
  gulp.watch(sassFiles, ['sass']);
  gulp.watch(htmlFiles, browserSync.reload);
  gulp.watch(jsFiles, browserSync.reload);
});

// default
gulp.task('default', function(callback) {
  runSequence(['browser-sync', 'sass'],
    'watch',
    callback
  );
});